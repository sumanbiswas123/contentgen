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
#include "WebView2.h"

#pragma comment(lib, "wininet.lib")
#pragma comment(lib, "shell32.lib")
#pragma comment(lib, "ole32.lib")
#pragma comment(lib, "gdi32.lib")

// Define function pointers for WebView2Loader functions loaded dynamically
typedef HRESULT(STDAPICALLTYPE* CreateCoreWebView2EnvironmentWithOptionsFn)(
    PCWSTR browserExecutableFolder,
    PCWSTR userDataFolder,
    ICoreWebView2EnvironmentOptions* environmentOptions,
    ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler* environmentCreatedHandler);

static CreateCoreWebView2EnvironmentWithOptionsFn g_CreateCoreWebView2EnvironmentWithOptions = nullptr;

// Relay callback: child webview posts messages → this fn forwards them to parent webview JS
typedef void(*ChildMessageRelayFn)(const char* json_utf8);
static ChildMessageRelayFn g_message_relay_fn = nullptr;

static const GUID Local_IID_ICoreWebView2WebMessageReceivedEventHandler =
    { 0x57213F19, 0x00E6, 0x49FA, { 0x8E, 0x07, 0x89, 0x8E, 0xA0, 0x1E, 0xCB, 0xD2 } };

// COM handler: fires when child webview calls chrome.webview.postMessage()
class ChildWebMessageHandler : public ICoreWebView2WebMessageReceivedEventHandler {
    ULONG m_ref = 1;
public:
    HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** pp) override {
        if (riid == IID_IUnknown ||
            riid == Local_IID_ICoreWebView2WebMessageReceivedEventHandler) {
            *pp = this; AddRef(); return S_OK;
        }
        *pp = nullptr; return E_NOINTERFACE;
    }
    ULONG STDMETHODCALLTYPE AddRef()  override { return InterlockedIncrement(&m_ref); }
    ULONG STDMETHODCALLTYPE Release() override {
        ULONG c = InterlockedDecrement(&m_ref);
        if (c == 0) delete this;
        return c;
    }
    HRESULT STDMETHODCALLTYPE Invoke(ICoreWebView2* /*sender*/,
                                     ICoreWebView2WebMessageReceivedEventArgs* args) override {
        if (!g_message_relay_fn) return S_OK;
        LPWSTR wmsg = nullptr;
        if (FAILED(args->TryGetWebMessageAsString(&wmsg)) || !wmsg) return S_OK;
        int len = WideCharToMultiByte(CP_UTF8, 0, wmsg, -1, nullptr, 0, nullptr, nullptr);
        if (len > 0) {
            std::string utf8(len, '\0');
            WideCharToMultiByte(CP_UTF8, 0, wmsg, -1, &utf8[0], len, nullptr, nullptr);
            // Trim the null terminator stored by WideCharToMultiByte
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
    ICoreWebView2* webview = nullptr;
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

// Window Procedure for child webview container windows
LRESULT CALLBACK ChildWebViewWndProc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {
    ChildWebView* self = (ChildWebView*)GetWindowLongPtr(hwnd, GWLP_USERDATA);
    if (msg == WM_SIZE) {
        if (self && self->controller) {
            RECT r;
            GetClientRect(hwnd, &r);
            self->controller->put_Bounds(r);
        }
        return 0;
    }
    if (msg == WM_ERASEBKGND) {
        return 1; // Prevent background erasing to avoid flicker/flash
    }
    if (msg == WM_DESTROY) {
        if (self) {
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

// Ensure the window class is registered
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

// Dynamically load WebView2Loader.dll if not loaded already
static bool LoadWebView2Loader() {
    if (g_CreateCoreWebView2EnvironmentWithOptions) return true;
    HMODULE hDll = LoadLibraryA("WebView2Loader.dll");
    if (!hDll) return false;
    g_CreateCoreWebView2EnvironmentWithOptions = (CreateCoreWebView2EnvironmentWithOptionsFn)
        GetProcAddress(hDll, "CreateCoreWebView2EnvironmentWithOptions");
    return g_CreateCoreWebView2EnvironmentWithOptions != nullptr;
}

// Define GUIDs locally to avoid missing link symbols
static const GUID Local_IID_ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler = 
    { 0x4E8A3389, 0xC9D8, 0x4BD2, { 0xB6, 0xB5, 0x12, 0x4F, 0xEE, 0x6C, 0xC1, 0x4D } };

static const GUID Local_IID_ICoreWebView2CreateCoreWebView2ControllerCompletedHandler = 
    { 0x6C4819F3, 0xC9B7, 0x4260, { 0x81, 0x27, 0xC9, 0xF5, 0xBD, 0xE7, 0xF6, 0x8C } };

static const GUID Local_IID_ICoreWebView2Controller2 = 
    { 0xC979903E, 0xD4CA, 0x4213, { 0x86, 0x98, 0x93, 0x56, 0x06, 0x6A, 0x1E, 0x1A } };

// Cached global WebView2 Environment for instant instantiation
static ICoreWebView2Environment* g_cached_env = nullptr;

extern "C" void child_webview_preinit(void* parent_hwnd) {
    CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
    if (g_cached_env || !LoadWebView2Loader()) return;

    class EnvironmentHandler : public ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler {
    private:
        ULONG m_ref = 1;
    public:
        HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** ppvObject) override {
            if (riid == Local_IID_ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler || 
                riid == IID_IUnknown) {
                *ppvObject = this;
                AddRef();
                return S_OK;
            }
            *ppvObject = nullptr;
            return E_NOINTERFACE;
        }
        ULONG STDMETHODCALLTYPE AddRef() override { return InterlockedIncrement(&m_ref); }
        ULONG STDMETHODCALLTYPE Release() override {
            ULONG count = InterlockedDecrement(&m_ref);
            if (count == 0) {
                delete this;
            }
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

    HRESULT hr = g_CreateCoreWebView2EnvironmentWithOptions(nullptr, wprofile_dir.c_str(), nullptr, handler);
    handler->Release();
}

extern "C" void* child_webview_create(void* parent_hwnd, const char* url, const char* key) {
    CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
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
        0, "ChildWebViewClass", "",
        WS_CHILD | WS_VISIBLE | WS_CLIPCHILDREN | WS_CLIPSIBLINGS,
        -32000, -32000, 1280, 720,
        hParent, NULL, GetModuleHandle(NULL), NULL
    );

    SetWindowLongPtr(cwv->hwnd, GWLP_USERDATA, (LONG_PTR)cwv);

class ChildWebViewCompletedHandler : 
    public ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler,
    public ICoreWebView2CreateCoreWebView2ControllerCompletedHandler {
private:
    ChildWebView* m_parent;
    ULONG m_refCount = 1;
    bool m_isControllerHandler = false;
    ICoreWebView2Environment* m_env = nullptr;
    std::function<void(ICoreWebView2Environment*)> m_callback;

public:
    ChildWebViewCompletedHandler(ChildWebView* parent, bool isControllerHandler = false, ICoreWebView2Environment* env = nullptr, std::function<void(ICoreWebView2Environment*)> cb = nullptr) 
        : m_parent(parent), m_isControllerHandler(isControllerHandler), m_env(env), m_callback(cb) {}

    // IUnknown
    HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** ppvObject) override {
        if (!ppvObject) return E_POINTER;
        if (m_isControllerHandler) {
            if (riid == IID_IUnknown || riid == Local_IID_ICoreWebView2CreateCoreWebView2ControllerCompletedHandler) {
                *ppvObject = (ICoreWebView2CreateCoreWebView2ControllerCompletedHandler*)this;
                AddRef();
                return S_OK;
            }
        } else {
            if (riid == IID_IUnknown || riid == Local_IID_ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler) {
                *ppvObject = (ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler*)this;
                AddRef();
                return S_OK;
            }
        }
        *ppvObject = nullptr;
        return E_NOINTERFACE;
    }

    ULONG STDMETHODCALLTYPE AddRef() override {
        return InterlockedIncrement(&m_refCount);
    }

    ULONG STDMETHODCALLTYPE Release() override {
        ULONG count = InterlockedDecrement(&m_refCount);
        if (count == 0) {
            delete this;
        }
        return count;
    }

    // ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler
    HRESULT STDMETHODCALLTYPE Invoke(HRESULT result, ICoreWebView2Environment* env) override {
        if (FAILED(result) || !env) {
            return result;
        }
        
        g_cached_env = env;
        g_cached_env->AddRef();
        
        if (m_callback) {
            m_callback(env);
        }
        return S_OK;
    }

    // ICoreWebView2CreateCoreWebView2ControllerCompletedHandler
    HRESULT STDMETHODCALLTYPE Invoke(HRESULT result, ICoreWebView2Controller* controller) override {
        if (FAILED(result) || !controller) {
            return result;
        }
        m_parent->controller = controller;
        controller->AddRef();

        controller->get_CoreWebView2(&m_parent->webview);
        m_parent->webview->AddRef();

        RECT r = { 0, 0, m_parent->last_w, m_parent->last_h };
        controller->put_Bounds(r);
        controller->put_IsVisible(m_parent->last_visible ? TRUE : FALSE);

        // Enable 100% transparent background for popup/modal overlay webview instances
        ICoreWebView2Controller2* controller2 = nullptr;
        if (SUCCEEDED(controller->QueryInterface(Local_IID_ICoreWebView2Controller2, (void**)&controller2)) && controller2) {
            COREWEBVIEW2_COLOR transparentColor = { 0, 0, 0, 0 }; // 0% opacity alpha
            controller2->put_DefaultBackgroundColor(transparentColor);
            controller2->Release();
        }

        // Dynamically map C:\ root on the child webview instance so local image files resolve cleanly
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

        double zoom = 1.0;
        if (m_parent->last_layout_w > 0 && m_parent->last_w < m_parent->last_layout_w) {
            zoom = (double)m_parent->last_w / (double)m_parent->last_layout_w;
        }
        HRESULT hrZoom = controller->put_ZoomFactor(zoom);
        
        FILE* f = fopen("webview_debug.txt", "a");
        if (f) {
            fprintf(f, "[Invoke] Applied zoom=%.4f, hr=0x%lx | last_w=%d, last_layout_w=%d\n", 
                    zoom, hrZoom, m_parent->last_w, m_parent->last_layout_w);
            fclose(f);
        }

        if (!m_parent->pending_html.empty()) {
            m_parent->webview->NavigateToString(m_parent->pending_html.c_str());
        } else if (!m_parent->pending_url.empty()) {
            m_parent->webview->Navigate(m_parent->pending_url.c_str());
        }

        // Register WebMessageReceived relay so child → parent IPC works
        ChildWebMessageHandler* msgHandler = new ChildWebMessageHandler();
        m_parent->webview->add_WebMessageReceived(msgHandler, nullptr);
        msgHandler->Release();

        m_parent->is_initialized = true;
        return S_OK;
    }
};

    auto create_controller = [cwv](ICoreWebView2Environment* env) {
        ChildWebViewCompletedHandler* controllerHandler = new ChildWebViewCompletedHandler(cwv, true, env);
        HRESULT hr = env->CreateCoreWebView2Controller(cwv->hwnd, controllerHandler);
        controllerHandler->Release();
    };

    if (g_cached_env) {
        OutputDebugStringA("[ChildWebView] Using cached environment\n");
        create_controller(g_cached_env);
    } else {
        wchar_t appdata[MAX_PATH];
        std::wstring wprofile_dir = L"";
        if (SUCCEEDED(SHGetFolderPathW(NULL, CSIDL_APPDATA, NULL, 0, appdata))) {
            wprofile_dir = std::wstring(appdata) + L"\\ContentGenStudio\\WebViewData";
        }

        ChildWebViewCompletedHandler* envHandler = new ChildWebViewCompletedHandler(cwv, false, nullptr, create_controller);
        HRESULT hr = g_CreateCoreWebView2EnvironmentWithOptions(nullptr, wprofile_dir.c_str(), nullptr, envHandler);
        if (FAILED(hr)) {
            char buf[128];
            wsprintfA(buf, "CreateCoreWebView2EnvironmentWithOptions FAILED hr=0x%lx", hr);
            MessageBoxA(NULL, buf, "WebView2 Debug", MB_OK | MB_ICONERROR);
        }
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
        HWND hParent = GetAncestor(cwv->hwnd, GA_PARENT);
        POINT pt = { xs, ys };
        HWND foundWebView = NULL;
        if (hParent) {
            HWND hWebView = GetWindow(hParent, GW_CHILD);
            while (hWebView != NULL) {
                if (hWebView != cwv->hwnd) {
                    foundWebView = hWebView;
                    break;
                }
                hWebView = GetWindow(hWebView, GW_HWNDNEXT);
            }
            if (foundWebView) {
                ClientToScreen(foundWebView, &pt);
                ScreenToClient(hParent, &pt);
            }
        }

        // Write debug info to a file in the project directory
        FILE* f = fopen("webview_debug.txt", "a");
        if (f) {
            char parentClass[256] = {0};
            char webviewClass[256] = {0};
            if (hParent) GetClassNameA(hParent, parentClass, sizeof(parentClass));
            if (foundWebView) GetClassNameA(foundWebView, webviewClass, sizeof(webviewClass));
            fprintf(f, "INPUT: x=%d, y=%d | SCALED: xs=%d, ys=%d | OUTPUT: pt.x=%d, pt.y=%d | scale=%.2f | hParent=%p (%s)\n",
                    x, y, xs, ys, pt.x, pt.y, scale, hParent, parentClass);
            fclose(f);
        }
        
        if (visible) {
            SetWindowPos(cwv->hwnd, HWND_TOP, pt.x, pt.y, ws, hs, SWP_SHOWWINDOW | SWP_NOACTIVATE);
            if (cwv->key != "popup_view") {
                int r = (int)(16 * scale * 2); // Smooth anti-aliased 16px corner radius diameter
                HRGN hRgn = CreateRoundRectRgn(0, 0, ws + 1, hs + 1, r, r);
                if (hRgn) {
                    SetWindowRgn(cwv->hwnd, hRgn, TRUE);
                }
            } else {
                SetWindowRgn(cwv->hwnd, NULL, TRUE);
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

        double zoom = 1.0;
        if (layout_w > 0 && w < layout_w) {
            zoom = (double)w / (double)layout_w;
        }
        cwv->controller->put_ZoomFactor(zoom);
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
        MultiByteToWideChar(CP_UTF8, 0, html, -1, &whtml[0], wlen);
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

// Register a C callback that is called whenever the child webview posts a message
// via chrome.webview.postMessage(). Zig uses this to relay messages to the parent.
extern "C" void child_webview_set_relay_fn(void* fn_ptr) {
    g_message_relay_fn = (ChildMessageRelayFn)fn_ptr;
}
