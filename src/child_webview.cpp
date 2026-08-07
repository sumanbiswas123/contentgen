#include <windows.h>
#include <stdlib.h>
#include <string>
#include <functional>
#include <wininet.h>
#include <shlobj.h>
#include <shlwapi.h>
#include <shobjidl.h>
#include <objbase.h>
#include <comdef.h>
#include <dcomp.h>
#include <dwmapi.h>
#include "WebView2.h"

#pragma comment(lib, "wininet.lib")
#pragma comment(lib, "shell32.lib")
#pragma comment(lib, "ole32.lib")
#pragma comment(lib, "gdi32.lib")
#pragma comment(lib, "dcomp.lib")
#pragma comment(lib, "dwmapi.lib")

#ifndef DWMWA_WINDOW_CORNER_PREFERENCE
#define DWMWA_WINDOW_CORNER_PREFERENCE 33
#endif
#ifndef DWMWCP_ROUND
#define DWMWCP_ROUND 2
#endif
#ifndef DWMWCP_DONOTROUND
#define DWMWCP_DONOTROUND 1
#endif

// Dynamic DirectComposition entry point
typedef HRESULT(WINAPI* DCompositionCreateDeviceFn)(
    IDXGIDevice* dxgiDevice,
    REFIID iid,
    void** dcompositionDevice);

// Dynamic WebView2Loader function pointer
typedef HRESULT(STDAPICALLTYPE* CreateCoreWebView2EnvironmentWithOptionsFn)(
    PCWSTR browserExecutableFolder,
    PCWSTR userDataFolder,
    ICoreWebView2EnvironmentOptions* environmentOptions,
    ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler* environmentCreatedHandler);

static CreateCoreWebView2EnvironmentWithOptionsFn g_CreateCoreWebView2EnvironmentWithOptions = nullptr;

// Relay callback: child webview posts messages → forwards to parent JS
typedef void(*ChildMessageRelayFn)(const char* json_utf8);
static ChildMessageRelayFn g_message_relay_fn = nullptr;

static const GUID Local_IID_ICoreWebView2WebMessageReceivedEventHandler =
    { 0x57213F19, 0x00E6, 0x49FA, { 0x8E, 0x07, 0x89, 0x8E, 0xA0, 0x1E, 0xCB, 0xD2 } };

static const GUID Local_IID_ICoreWebView2CompositionController =
    { 0x3DF9B733, 0xB9AE, 0x4A15, { 0x86, 0xB4, 0xEB, 0x9E, 0xE9, 0x82, 0x64, 0x69 } };

static const GUID Local_IID_ICoreWebView2CreateCoreWebView2CompositionControllerCompletedHandler =
    { 0x02FAB84B, 0x1428, 0x4FB7, { 0xAD, 0x45, 0x1B, 0x2E, 0x64, 0x73, 0x61, 0x84 } };

static const GUID Local_IID_ICoreWebView2Controller2 = 
    { 0xC979903E, 0xD4CA, 0x4228, { 0x92, 0xEB, 0x47, 0xEE, 0x3F, 0xA9, 0x6E, 0xAB } };

class ChildWebMessageHandler : public ICoreWebView2WebMessageReceivedEventHandler {
    ULONG m_ref = 1;
public:
    HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** pp) override {
        if (riid == IID_IUnknown || riid == Local_IID_ICoreWebView2WebMessageReceivedEventHandler) {
            *pp = this; AddRef(); return S_OK;
        }
        *pp = nullptr; return E_NOINTERFACE;
    }
    ULONG STDMETHODCALLTYPE AddRef() override { return InterlockedIncrement(&m_ref); }
    ULONG STDMETHODCALLTYPE Release() override {
        ULONG c = InterlockedDecrement(&m_ref);
        if (c == 0) delete this;
        return c;
    }
    HRESULT STDMETHODCALLTYPE Invoke(ICoreWebView2* /*sender*/, ICoreWebView2WebMessageReceivedEventArgs* args) override {
        if (!g_message_relay_fn) return S_OK;
        LPWSTR wmsg = nullptr;
        if (FAILED(args->TryGetWebMessageAsString(&wmsg)) || !wmsg) return S_OK;
        int len = WideCharToMultiByte(CP_UTF8, 0, wmsg, -1, nullptr, 0, nullptr, nullptr);
        if (len > 0) {
            std::string utf8(len, '\0');
            WideCharToMultiByte(CP_UTF8, 0, wmsg, -1, &utf8[0], len, nullptr, nullptr);
            if (!utf8.empty() && utf8.back() == '\0') utf8.pop_back();
            g_message_relay_fn(utf8.c_str());
        }
        CoTaskMemFree(wmsg);
        return S_OK;
    }
};

struct ChildWebView {
    HWND hwnd = nullptr;
    ICoreWebView2Controller* controller = nullptr;
    ICoreWebView2CompositionController* composition_controller = nullptr;
    ICoreWebView2* webview = nullptr;
    IDCompositionDevice* dcomp_device = nullptr;
    IDCompositionTarget* dcomp_target = nullptr;
    IDCompositionVisual* dcomp_visual = nullptr;
    IDCompositionRectangleClip* dcomp_clip = nullptr;
    std::wstring pending_url = L"";
    std::wstring pending_html = L"";
    bool is_initialized = false;
    int last_x = -32000;
    int last_y = -32000;
    int last_w = 1280;
    int last_h = 720;
    int last_layout_w = 1280;
    bool last_visible = false;
    std::string key = "";
};

LRESULT CALLBACK ChildWebViewWndProc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {
    ChildWebView* self = (ChildWebView*)GetWindowLongPtr(hwnd, GWLP_USERDATA);
    if (msg == WM_MOUSEMOVE || msg == WM_LBUTTONDOWN || msg == WM_LBUTTONUP ||
        msg == WM_RBUTTONDOWN || msg == WM_RBUTTONUP || msg == WM_MOUSEWHEEL ||
        msg == WM_MBUTTONDOWN || msg == WM_MBUTTONUP) 
    {
        if (self && self->composition_controller) {
            COREWEBVIEW2_MOUSE_EVENT_KIND kind = COREWEBVIEW2_MOUSE_EVENT_KIND_MOVE;
            if (msg == WM_LBUTTONDOWN) kind = COREWEBVIEW2_MOUSE_EVENT_KIND_LEFT_BUTTON_DOWN;
            else if (msg == WM_LBUTTONUP) kind = COREWEBVIEW2_MOUSE_EVENT_KIND_LEFT_BUTTON_UP;
            else if (msg == WM_RBUTTONDOWN) kind = COREWEBVIEW2_MOUSE_EVENT_KIND_RIGHT_BUTTON_DOWN;
            else if (msg == WM_RBUTTONUP) kind = COREWEBVIEW2_MOUSE_EVENT_KIND_RIGHT_BUTTON_UP;
            else if (msg == WM_MBUTTONDOWN) kind = COREWEBVIEW2_MOUSE_EVENT_KIND_MIDDLE_BUTTON_DOWN;
            else if (msg == WM_MBUTTONUP) kind = COREWEBVIEW2_MOUSE_EVENT_KIND_MIDDLE_BUTTON_UP;
            else if (msg == WM_MOUSEWHEEL) kind = COREWEBVIEW2_MOUSE_EVENT_KIND_WHEEL;

            COREWEBVIEW2_MOUSE_EVENT_VIRTUAL_KEYS keys = COREWEBVIEW2_MOUSE_EVENT_VIRTUAL_KEYS_NONE;
            if (wp & MK_LBUTTON) keys = (COREWEBVIEW2_MOUSE_EVENT_VIRTUAL_KEYS)(keys | COREWEBVIEW2_MOUSE_EVENT_VIRTUAL_KEYS_LEFT_BUTTON);
            if (wp & MK_RBUTTON) keys = (COREWEBVIEW2_MOUSE_EVENT_VIRTUAL_KEYS)(keys | COREWEBVIEW2_MOUSE_EVENT_VIRTUAL_KEYS_RIGHT_BUTTON);
            if (wp & MK_SHIFT)   keys = (COREWEBVIEW2_MOUSE_EVENT_VIRTUAL_KEYS)(keys | COREWEBVIEW2_MOUSE_EVENT_VIRTUAL_KEYS_SHIFT);
            if (wp & MK_CONTROL) keys = (COREWEBVIEW2_MOUSE_EVENT_VIRTUAL_KEYS)(keys | COREWEBVIEW2_MOUSE_EVENT_VIRTUAL_KEYS_CONTROL);

            POINT pt = { (SHORT)LOWORD(lp), (SHORT)HIWORD(lp) };
            if (msg == WM_MOUSEWHEEL) {
                ScreenToClient(hwnd, &pt);
            }

            UINT mouseData = 0;
            if (msg == WM_MOUSEWHEEL) {
                mouseData = (UINT)GET_WHEEL_DELTA_WPARAM(wp);
            }

            self->composition_controller->SendMouseInput(kind, keys, mouseData, pt);
            if (msg == WM_LBUTTONUP && g_message_relay_fn) {
                g_message_relay_fn("{\"type\":\"child-mouse-up\"}");
            }
            if (msg == WM_LBUTTONDOWN && self->controller) {
                self->controller->MoveFocus(COREWEBVIEW2_MOVE_FOCUS_REASON_PROGRAMMATIC);
            }
        }
        return 0;
    }
    if (msg == WM_SETCURSOR) {
        if (self && self->composition_controller) {
            HCURSOR hCursor = NULL;
            if (SUCCEEDED(self->composition_controller->get_Cursor(&hCursor)) && hCursor) {
                SetCursor(hCursor);
                return TRUE;
            }
        }
    }
    if (msg == WM_PAINT) {
        PAINTSTRUCT ps;
        HDC hdc = BeginPaint(hwnd, &ps);
        if (self && self->key != "popup_view") {
            RECT r;
            GetClientRect(hwnd, &r);
            HPEN hPen = CreatePen(PS_SOLID, 2, RGB(0, 0, 0));
            HBRUSH hNullBrush = (HBRUSH)GetStockObject(NULL_BRUSH);
            HPEN hOldPen = (HPEN)SelectObject(hdc, hPen);
            HBRUSH hOldBrush = (HBRUSH)SelectObject(hdc, hNullBrush);
            RoundRect(hdc, 0, 0, r.right, r.bottom, 32, 32);
            SelectObject(hdc, hOldPen);
            SelectObject(hdc, hOldBrush);
            DeleteObject(hPen);
        }
        EndPaint(hwnd, &ps);
        return 0;
    }
    if (msg == WM_SIZE) {
        if (self && self->controller) {
            RECT r;
            GetClientRect(hwnd, &r);
            self->controller->put_Bounds(r);
        }
        return 0;
    }
    if (msg == WM_ERASEBKGND) {
        return 1;
    }
    if (msg == WM_DESTROY) {
        if (self) {
            if (self->dcomp_clip) {
                self->dcomp_clip->Release();
                self->dcomp_clip = nullptr;
            }
            if (self->dcomp_target) {
                self->dcomp_target->SetRoot(nullptr);
                self->dcomp_target->Release();
                self->dcomp_target = nullptr;
            }
            if (self->dcomp_visual) {
                self->dcomp_visual->Release();
                self->dcomp_visual = nullptr;
            }
            if (self->dcomp_device) {
                self->dcomp_device->Release();
                self->dcomp_device = nullptr;
            }
            if (self->composition_controller) {
                self->composition_controller->Release();
                self->composition_controller = nullptr;
            }
            if (self->controller) {
                self->controller->Close();
                self->controller->Release();
                self->controller = nullptr;
            }
            if (self->webview) {
                self->webview->Release();
                self->webview = nullptr;
            }
            self->hwnd = nullptr;
        }
        return 0;
    }
    return DefWindowProc(hwnd, msg, wp, lp);
}

static void RegisterChildClass() {
    static bool registered = false;
    if (registered) return;
    WNDCLASSA wc = {};
    wc.style = CS_DROPSHADOW;
    wc.lpfnWndProc = ChildWebViewWndProc;
    wc.hInstance = GetModuleHandle(NULL);
    wc.lpszClassName = "ChildWebViewClass";
    wc.hbrBackground = NULL;
    RegisterClassA(&wc);
    registered = true;
}

static bool LoadWebView2Loader() {
    if (g_CreateCoreWebView2EnvironmentWithOptions) return true;
    HMODULE hDll = LoadLibraryA("WebView2Loader.dll");
    if (!hDll) return false;
    g_CreateCoreWebView2EnvironmentWithOptions = (CreateCoreWebView2EnvironmentWithOptionsFn)
        GetProcAddress(hDll, "CreateCoreWebView2EnvironmentWithOptions");
    return g_CreateCoreWebView2EnvironmentWithOptions != nullptr;
}

static const GUID Local_IID_ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler = 
    { 0x4E8A3389, 0xC9D8, 0x4BD2, { 0xB6, 0xB5, 0x12, 0x4F, 0xEE, 0x6C, 0xC1, 0x4D } };

static ICoreWebView2Environment* g_cached_env = nullptr;

extern "C" void child_webview_preinit(void* parent_hwnd) {
    OleInitialize(nullptr);
    if (g_cached_env || !LoadWebView2Loader()) return;

    class EnvironmentHandler : public ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler {
        ULONG m_ref = 1;
    public:
        HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** ppvObject) override {
            if (riid == Local_IID_ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler || riid == IID_IUnknown) {
                *ppvObject = this; AddRef(); return S_OK;
            }
            *ppvObject = nullptr; return E_NOINTERFACE;
        }
        ULONG STDMETHODCALLTYPE AddRef() override { return InterlockedIncrement(&m_ref); }
        ULONG STDMETHODCALLTYPE Release() override {
            ULONG count = InterlockedDecrement(&m_ref);
            if (count == 0) delete this;
            return count;
        }
        HRESULT STDMETHODCALLTYPE Invoke(HRESULT result, ICoreWebView2Environment* env) override {
            if (SUCCEEDED(result) && env) {
                g_cached_env = env;
                g_cached_env->AddRef();
            }
            return S_OK;
        }
    };

    EnvironmentHandler* handler = new EnvironmentHandler();
    wchar_t appdata[MAX_PATH];
    std::wstring wprofile_dir = L"";
    if (SUCCEEDED(SHGetFolderPathW(NULL, CSIDL_APPDATA, NULL, 0, appdata))) {
        wprofile_dir = std::wstring(appdata) + L"\\ContentGenStudio\\WebViewData";
    }

    g_CreateCoreWebView2EnvironmentWithOptions(nullptr, wprofile_dir.c_str(), nullptr, handler);
    handler->Release();
}

class ChildCompositionCompletedHandler : public ICoreWebView2CreateCoreWebView2CompositionControllerCompletedHandler {
    ChildWebView* m_parent;
    ULONG m_refCount = 1;
public:
    ChildCompositionCompletedHandler(ChildWebView* parent) : m_parent(parent) {}

    HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** ppvObject) override {
        if (!ppvObject) return E_POINTER;
        if (riid == IID_IUnknown || riid == Local_IID_ICoreWebView2CreateCoreWebView2CompositionControllerCompletedHandler) {
            *ppvObject = this; AddRef(); return S_OK;
        }
        *ppvObject = nullptr; return E_NOINTERFACE;
    }
    ULONG STDMETHODCALLTYPE AddRef() override { return InterlockedIncrement(&m_refCount); }
    ULONG STDMETHODCALLTYPE Release() override {
        ULONG count = InterlockedDecrement(&m_refCount);
        if (count == 0) delete this;
        return count;
    }

    HRESULT STDMETHODCALLTYPE Invoke(HRESULT result, ICoreWebView2CompositionController* compController) override {
        FILE* f = fopen("dcomp_log.txt", "a");
        if (f) {
            fprintf(f, "[Invoke] result=0x%lx, compController=%p\n", result, compController);
            fclose(f);
        }
        if (FAILED(result) || !compController) {
            return result;
        }
        m_parent->composition_controller = compController;
        compController->AddRef();

        HRESULT hrQi = compController->QueryInterface(IID_ICoreWebView2Controller, (void**)&m_parent->controller);
        if (f = fopen("dcomp_log.txt", "a")) {
            fprintf(f, "[Invoke] QI Controller hr=0x%lx, controller=%p\n", hrQi, m_parent->controller);
            fclose(f);
        }

        if (SUCCEEDED(hrQi) && m_parent->controller) {
            RECT r = { 0, 0, m_parent->last_w, m_parent->last_h };
            m_parent->controller->put_Bounds(r);
            m_parent->controller->put_IsVisible(m_parent->last_visible ? TRUE : FALSE);

            m_parent->controller->get_CoreWebView2(&m_parent->webview);
            if (m_parent->webview) {
                m_parent->webview->AddRef();
            }

            // Create DirectComposition Device & Target
            HMODULE hDcomp = LoadLibraryA("dcomp.dll");
            if (f = fopen("dcomp_log.txt", "a")) {
                fprintf(f, "[Invoke] LoadLibrary dcomp.dll hDcomp=%p\n", hDcomp);
                fclose(f);
            }
            if (hDcomp) {
                DCompositionCreateDeviceFn pDCompositionCreateDevice = 
                    (DCompositionCreateDeviceFn)GetProcAddress(hDcomp, "DCompositionCreateDevice");
                if (f = fopen("dcomp_log.txt", "a")) {
                    fprintf(f, "[Invoke] GetProcAddress pDCompositionCreateDevice=%p\n", pDCompositionCreateDevice);
                    fclose(f);
                }
                if (pDCompositionCreateDevice) {
                    HRESULT hrDev = pDCompositionCreateDevice(nullptr, __uuidof(IDCompositionDevice), (void**)&m_parent->dcomp_device);
                    if (f = fopen("dcomp_log.txt", "a")) {
                        fprintf(f, "[Invoke] DCompositionCreateDevice hr=0x%lx, dev=%p\n", hrDev, m_parent->dcomp_device);
                        fclose(f);
                    }
                    if (m_parent->dcomp_device) {
                        m_parent->dcomp_device->CreateTargetForHwnd(m_parent->hwnd, TRUE, &m_parent->dcomp_target);
                        m_parent->dcomp_device->CreateVisual(&m_parent->dcomp_visual);

                        IUnknown* wvVisual = nullptr;
                        HRESULT hrVis = compController->get_RootVisualTarget(&wvVisual);
                        if (f = fopen("dcomp_log.txt", "a")) {
                            fprintf(f, "[Invoke] get_RootVisualTarget hr=0x%lx, wvVisual=%p\n", hrVis, wvVisual);
                            fclose(f);
                        }
                        if (SUCCEEDED(hrVis) && wvVisual) {
                            if (m_parent->dcomp_visual) {
                                m_parent->dcomp_visual->SetContent(wvVisual);
                            }
                            wvVisual->Release();
                        }

                        if (m_parent->dcomp_target && m_parent->dcomp_visual) {
                            m_parent->dcomp_target->SetRoot(m_parent->dcomp_visual);
                            compController->put_RootVisualTarget(m_parent->dcomp_visual);
                            m_parent->dcomp_device->Commit();
                        }
                    }
                }
            }

            ICoreWebView2Controller2* controller2 = nullptr;
            if (SUCCEEDED(m_parent->controller->QueryInterface(Local_IID_ICoreWebView2Controller2, (void**)&controller2)) && controller2) {
                COREWEBVIEW2_COLOR transparentColor = { 0, 0, 0, 0 };
                controller2->put_DefaultBackgroundColor(transparentColor);
                controller2->Release();
            }

            ICoreWebView2_3* webview3 = nullptr;
            static const GUID Local_IID_ICoreWebView2_3 = { 0xA0D068D5, 0xB784, 0x4296, { 0x81, 0x48, 0xAA, 0x51, 0x93, 0xB3, 0x82, 0x82 } };
            if (m_parent->webview && SUCCEEDED(m_parent->webview->QueryInterface(Local_IID_ICoreWebView2_3, (void**)&webview3)) && webview3) {
                webview3->SetVirtualHostNameToFolderMapping(
                    L"local-drive.contentgen",
                    L"C:\\",
                    COREWEBVIEW2_HOST_RESOURCE_ACCESS_KIND_ALLOW
                );
                webview3->Release();
            }

            // Always keep zoom at 1.0 so CSS media queries use the real viewport width.
            // The container div in React is already sized to activeViewWidth, so the physical
            // WebView width already matches the intended device width — no zoom scaling needed.
            m_parent->controller->put_ZoomFactor(1.0);

            if (!m_parent->pending_html.empty()) {
                m_parent->webview->NavigateToString(m_parent->pending_html.c_str());
            } else if (!m_parent->pending_url.empty()) {
                m_parent->webview->Navigate(m_parent->pending_url.c_str());
            }

            ChildWebMessageHandler* msgHandler = new ChildWebMessageHandler();
            m_parent->webview->add_WebMessageReceived(msgHandler, nullptr);
            msgHandler->Release();

            m_parent->is_initialized = true;
        }
        return S_OK;
    }
};

extern "C" void* child_webview_create(void* parent_hwnd, const char* url, const char* key) {
    OleInitialize(nullptr);
    RegisterChildClass();
    if (!LoadWebView2Loader()) return nullptr;

    HWND hParent = (HWND)parent_hwnd;
    ChildWebView* cwv = new ChildWebView();
    cwv->key = key ? key : "";

    int wlen = MultiByteToWideChar(CP_UTF8, 0, url, -1, NULL, 0);
    if (wlen > 0) {
        cwv->pending_url.resize(wlen);
        MultiByteToWideChar(CP_UTF8, 0, url, -1, &cwv->pending_url[0], wlen);
    }

    cwv->hwnd = CreateWindowExA(
        WS_EX_ACCEPTFILES, "ChildWebViewClass", "",
        WS_CHILD | WS_VISIBLE | WS_CLIPCHILDREN | WS_CLIPSIBLINGS,
        -32000, -32000, 1280, 720,
        hParent, NULL, GetModuleHandle(NULL), NULL
    );

    SetWindowLongPtr(cwv->hwnd, GWLP_USERDATA, (LONG_PTR)cwv);

    auto create_composition = [cwv](ICoreWebView2Environment* env) {
        ICoreWebView2Environment3* env3 = nullptr;
        static const GUID Local_IID_ICoreWebView2Environment3 = 
            { 0x80A22AE3, 0xBE7C, 0x4CE2, { 0xAF, 0xE1, 0x5A, 0x50, 0x05, 0x6C, 0xDE, 0xEB } };

        HRESULT hrQi = env->QueryInterface(Local_IID_ICoreWebView2Environment3, (void**)&env3);
        FILE* f = fopen("dcomp_log.txt", "a");
        if (f) {
            fprintf(f, "[create_composition] QI ICoreWebView2Environment3 hr=0x%lx, env3=%p\n", hrQi, env3);
            fclose(f);
        }

        if (SUCCEEDED(hrQi) && env3) {
            ChildCompositionCompletedHandler* compHandler = new ChildCompositionCompletedHandler(cwv);
            HRESULT hrComp = env3->CreateCoreWebView2CompositionController(cwv->hwnd, (ICoreWebView2CreateCoreWebView2CompositionControllerCompletedHandler*)compHandler);
            if (f = fopen("dcomp_log.txt", "a")) {
                fprintf(f, "[create_composition] CreateCoreWebView2CompositionController hr=0x%lx\n", hrComp);
                fclose(f);
            }
            env3->Release();
        }
    };

    if (g_cached_env) {
        create_composition(g_cached_env);
    } else {
        wchar_t appdata[MAX_PATH];
        std::wstring wprofile_dir = L"";
        if (SUCCEEDED(SHGetFolderPathW(NULL, CSIDL_APPDATA, NULL, 0, appdata))) {
            wprofile_dir = std::wstring(appdata) + L"\\ContentGenStudio\\WebViewData";
        }

        class EnvCompleted : public ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler {
            std::function<void(ICoreWebView2Environment*)> m_cb;
            ULONG m_ref = 1;
        public:
            EnvCompleted(std::function<void(ICoreWebView2Environment*)> cb) : m_cb(cb) {}
            HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** pp) override {
                if (riid == IID_IUnknown || riid == Local_IID_ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler) {
                    *pp = this; AddRef(); return S_OK;
                }
                *pp = nullptr; return E_NOINTERFACE;
            }
            ULONG STDMETHODCALLTYPE AddRef() override { return InterlockedIncrement(&m_ref); }
            ULONG STDMETHODCALLTYPE Release() override {
                ULONG c = InterlockedDecrement(&m_ref);
                if (c == 0) delete this;
                return c;
            }
            HRESULT STDMETHODCALLTYPE Invoke(HRESULT res, ICoreWebView2Environment* env) override {
                if (SUCCEEDED(res) && env) {
                    g_cached_env = env;
                    g_cached_env->AddRef();
                    m_cb(env);
                }
                return S_OK;
            }
        };

        EnvCompleted* envHandler = new EnvCompleted(create_composition);
        g_CreateCoreWebView2EnvironmentWithOptions(nullptr, wprofile_dir.c_str(), nullptr, envHandler);
        envHandler->Release();
    }

    return (void*)cwv;
}

extern "C" void child_webview_destroy(void* handle) {
    if (!handle) return;
    ChildWebView* cwv = (ChildWebView*)handle;
    if (cwv->hwnd && IsWindow(cwv->hwnd)) {
        DestroyWindow(cwv->hwnd);
    }
    delete cwv;
}

static double GetDpiScale(HWND hwnd) {
    UINT dpi = 96;
    HMODULE hUser32 = GetModuleHandleA("user32.dll");
    if (hUser32) {
        typedef UINT(WINAPI* GetDpiForWindowFn)(HWND);
        GetDpiForWindowFn pGetDpiForWindow = (GetDpiForWindowFn)GetProcAddress(hUser32, "GetDpiForWindow");
        if (pGetDpiForWindow) {
            dpi = pGetDpiForWindow(hwnd);
        } else {
            typedef UINT(WINAPI* GetDpiForSystemFn)();
            GetDpiForSystemFn pGetDpiForSystem = (GetDpiForSystemFn)GetProcAddress(hUser32, "GetDpiForSystem");
            if (pGetDpiForSystem) {
                dpi = pGetDpiForSystem();
            }
        }
    }
    return (double)dpi / 96.0;
}

extern "C" void child_webview_set_bounds(void* handle, int x, int y, int w, int h, bool visible, int layout_w) {
    if (!handle) return;
    ChildWebView* cwv = (ChildWebView*)handle;
    cwv->last_x = x;
    cwv->last_y = y;
    cwv->last_w = w;
    cwv->last_h = h;
    cwv->last_layout_w = layout_w;
    cwv->last_visible = visible;

    double scale = 1.0;
    if (cwv->hwnd && IsWindow(cwv->hwnd)) {
        scale = GetDpiScale(cwv->hwnd);
    }
    int xs = (int)(x * scale);
    int ys = (int)(y * scale);
    int ws = (int)(w * scale);
    int hs = (int)(h * scale);

    if (cwv->hwnd && IsWindow(cwv->hwnd)) {
        POINT pt = { xs, ys };
        if (visible) {
            SetWindowPos(cwv->hwnd, HWND_TOP, pt.x, pt.y, ws, hs, SWP_SHOWWINDOW | SWP_NOACTIVATE);
            SetWindowRgn(cwv->hwnd, NULL, TRUE);
            if (cwv->key != "popup_view") {
                int cornerPref = DWMWCP_ROUND;
                DwmSetWindowAttribute(cwv->hwnd, DWMWA_WINDOW_CORNER_PREFERENCE, &cornerPref, sizeof(cornerPref));
            } else {
                int cornerPref = DWMWCP_DONOTROUND;
                DwmSetWindowAttribute(cwv->hwnd, DWMWA_WINDOW_CORNER_PREFERENCE, &cornerPref, sizeof(cornerPref));
            }
        } else {
            SetWindowRgn(cwv->hwnd, NULL, TRUE);
            SetWindowPos(cwv->hwnd, NULL, -32000, -32000, ws, hs, SWP_HIDEWINDOW | SWP_NOACTIVATE);
        }
    }

    if (cwv->controller) {
        RECT bounds = { 0, 0, ws, hs };
        cwv->controller->put_Bounds(bounds);
        cwv->controller->put_IsVisible(visible ? TRUE : FALSE);

        if (cwv->dcomp_device && cwv->dcomp_visual) {
            if (!cwv->dcomp_clip) {
                cwv->dcomp_device->CreateRectangleClip(&cwv->dcomp_clip);
            }
            if (cwv->dcomp_clip) {
                cwv->dcomp_clip->SetLeft(0.0f);
                cwv->dcomp_clip->SetTop(0.0f);
                cwv->dcomp_clip->SetRight((float)ws);
                cwv->dcomp_clip->SetBottom((float)hs);
                if (cwv->key != "popup_view") {
                    float radius = 14.0f * (float)scale;
                    cwv->dcomp_clip->SetTopLeftRadiusX(radius);
                    cwv->dcomp_clip->SetTopLeftRadiusY(radius);
                    cwv->dcomp_clip->SetTopRightRadiusX(radius);
                    cwv->dcomp_clip->SetTopRightRadiusY(radius);
                    cwv->dcomp_clip->SetBottomLeftRadiusX(radius);
                    cwv->dcomp_clip->SetBottomLeftRadiusY(radius);
                    cwv->dcomp_clip->SetBottomRightRadiusX(radius);
                    cwv->dcomp_clip->SetBottomRightRadiusY(radius);
                }
                cwv->dcomp_visual->SetClip(cwv->dcomp_clip);
                cwv->dcomp_device->Commit();
            }
        }

        // Always keep zoom at 1.0 — the WebView physical bounds already equal the
        // container width set by React, so media queries fire at the correct breakpoints.
        cwv->controller->put_ZoomFactor(1.0);
    }
}

extern "C" void child_webview_navigate(void* handle, const char* url) {
    if (!handle || !url) return;
    ChildWebView* cwv = (ChildWebView*)handle;

    int wlen = MultiByteToWideChar(CP_UTF8, 0, url, -1, NULL, 0);
    if (wlen > 0) {
        std::wstring wurl(wlen, 0);
        MultiByteToWideChar(CP_UTF8, 0, url, -1, &wurl[0], wlen);
        cwv->pending_url = wurl;
        if (cwv->webview) {
            cwv->webview->Navigate(wurl.c_str());
        }
    }
}

extern "C" void child_webview_navigate_to_string(void* handle, const char* html) {
    if (!handle || !html) return;
    ChildWebView* cwv = (ChildWebView*)handle;

    int wlen = MultiByteToWideChar(CP_UTF8, 0, html, -1, NULL, 0);
    if (wlen > 0) {
        std::wstring whtml(wlen, 0);
        MultiByteToWideChar(CP_UTF8, 0, html, -1, &whtml[0], whtml.length());
        cwv->pending_html = whtml;
        if (cwv->webview) {
            cwv->webview->NavigateToString(whtml.c_str());
        }
    }
}

extern "C" void child_webview_eval(void* handle, const char* js) {
    if (!handle || !js) return;
    ChildWebView* cwv = (ChildWebView*)handle;
    if (cwv->webview) {
        int wlen = MultiByteToWideChar(CP_UTF8, 0, js, -1, NULL, 0);
        if (wlen > 0) {
            std::wstring wjs(wlen, 0);
            MultiByteToWideChar(CP_UTF8, 0, js, -1, &wjs[0], wlen);
            cwv->webview->ExecuteScript(wjs.c_str(), nullptr);
        }
    }
}

extern "C" void child_webview_set_relay_fn(void* fn_ptr) {
    g_message_relay_fn = (ChildMessageRelayFn)fn_ptr;
}
