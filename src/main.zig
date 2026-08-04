const std = @import("std");
const Webview = @import("webview").Webview;

// ─── Config ────────────────────────────────────────────────────────────────────
var UI_ROOT: []const u8 = "dist";
const LOCAL_SERVER_PORT: u16 = 9732;

// ─── Child Webview C++ Helper bindings ─────────────────────────────────────────
extern "c" fn child_webview_preinit(parent_hwnd: ?*anyopaque) void;
extern "c" fn child_webview_create(parent_hwnd: ?*anyopaque, url: [*:0]const u8, key: [*:0]const u8) ?*anyopaque;
extern "c" fn child_webview_destroy(handle: ?*anyopaque) void;
extern "c" fn child_webview_set_bounds(handle: ?*anyopaque, x: c_int, y: c_int, w: c_int, h: c_int, visible: bool, layout_w: c_int) void;
extern "c" fn child_webview_navigate(handle: ?*anyopaque, url: [*:0]const u8) void;
extern "c" fn child_webview_navigate_to_string(handle: ?*anyopaque, html: [*:0]const u8) void;
extern "c" fn child_webview_eval(handle: ?*anyopaque, js: [*:0]const u8) void;
extern "c" fn child_webview_set_relay_fn(fn_ptr: ?*anyopaque) void;

// Global state for child webview canvas instance
var g_child_webview_handle: ?*anyopaque = null;
var g_popup_webview_handle: ?*anyopaque = null;
var g_parent_hwnd: ?*anyopaque = null;
var g_main_webview: ?*Webview = null;

// ─── Cached static file ───────────────────────────────────────────────────────
const CachedFile = struct { content: []const u8, mime: []const u8 };
var g_static_files: std.StringHashMap(CachedFile) = undefined;

// ─── Win32 / C stdlib ─────────────────────────────────────────────────────────
extern "c" fn fopen(filename: [*:0]const u8, mode: [*:0]const u8) ?*anyopaque;
extern "c" fn fclose(stream: ?*anyopaque) c_int;
extern "c" fn fseek(stream: ?*anyopaque, offset: c_long, origin: c_int) c_int;
extern "c" fn ftell(stream: ?*anyopaque) c_long;
extern "c" fn fread(ptr: *anyopaque, size: usize, nmemb: usize, stream: ?*anyopaque) usize;
extern "c" fn fwrite(ptr: *const anyopaque, size: usize, nmemb: usize, stream: ?*anyopaque) usize;
extern "kernel32" fn Sleep(dwMilliseconds: u32) callconv(.winapi) void;
extern "kernel32" fn GetModuleFileNameA(hModule: ?*anyopaque, lpFilename: [*]u8, nSize: u32) callconv(.winapi) u32;

// ─── Win32 FindFile ───────────────────────────────────────────────────────────
const win32_find = struct {
    const HANDLE = *anyopaque;
    const INVALID_HANDLE_VALUE = @as(HANDLE, @ptrFromInt(@as(usize, @bitCast(@as(isize, -1)))));
    const WIN32_FIND_DATAA = extern struct {
        dwFileAttributes: u32,
        ftCreationTime: [2]u32,
        ftLastAccessTime: [2]u32,
        ftLastWriteTime: [2]u32,
        nFileSizeHigh: u32,
        nFileSizeLow: u32,
        dwReserved0: u32,
        dwReserved1: u32,
        cFileName: [260]u8,
        cAlternateFileName: [14]u8,
    };
    extern "kernel32" fn FindFirstFileA(lpFileName: [*:0]const u8, lpFindFileData: *WIN32_FIND_DATAA) callconv(.winapi) HANDLE;
    extern "kernel32" fn FindNextFileA(hFindFile: HANDLE, lpFindFileData: *WIN32_FIND_DATAA) callconv(.winapi) i32;
    extern "kernel32" fn FindClose(hFindFile: HANDLE) callconv(.winapi) i32;
};

// ─── Winsock ──────────────────────────────────────────────────────────────────
const WSADATA = extern struct {
    wVersion: u16, wHighVersion: u16,
    szDescription: [257]u8, szSystemStatus: [129]u8,
    iMaxSockets: u16, iMaxUdpDg: u16, lpVendorInfo: ?*u8,
};
const SOCKADDR_IN = extern struct {
    sin_family: u16, sin_port: u16, sin_addr: u32, sin_zero: [8]u8,
};
const INVALID_SOCKET: usize = ~@as(usize, 0);
const SOCKET_ERROR: c_int = -1;
const AF_INET: u16 = 2;
const SOCK_STREAM: c_int = 1;
const SOL_SOCKET: c_int = 0xFFFF;
const SO_REUSEADDR: c_int = 4;
const IPPROTO_TCP: c_int = 6;

extern "ws2_32" fn WSAStartup(wVersionRequired: u16, lpWSAData: *WSADATA) callconv(.winapi) c_int;
extern "ws2_32" fn WSACleanup() callconv(.winapi) c_int;
extern "ws2_32" fn socket(af: c_int, stype: c_int, protocol: c_int) callconv(.winapi) usize;
extern "ws2_32" fn bind(s: usize, name: *const SOCKADDR_IN, namelen: c_int) callconv(.winapi) c_int;
extern "ws2_32" fn listen(s: usize, backlog: c_int) callconv(.winapi) c_int;
extern "ws2_32" fn accept(s: usize, addr: ?*SOCKADDR_IN, addrlen: ?*c_int) callconv(.winapi) usize;
extern "ws2_32" fn recv(s: usize, buf: [*]u8, len: c_int, flags: c_int) callconv(.winapi) c_int;
extern "ws2_32" fn send(s: usize, buf: [*]const u8, len: c_int, flags: c_int) callconv(.winapi) c_int;
extern "ws2_32" fn closesocket(s: usize) callconv(.winapi) c_int;
extern "ws2_32" fn setsockopt(s: usize, level: c_int, optname: c_int, optval: *const c_int, optlen: c_int) callconv(.winapi) c_int;
extern "ws2_32" fn htons(hostshort: u16) callconv(.winapi) u16;
extern "ws2_32" fn htonl(hostlong: u32) callconv(.winapi) u32;

// ─── Helpers ──────────────────────────────────────────────────────────────────
fn getOwnExePath(allocator: std.mem.Allocator) ?[]const u8 {
    var buf: [1024]u8 = undefined;
    const len = GetModuleFileNameA(null, &buf, buf.len);
    if (len == 0) return null;
    return allocator.dupe(u8, buf[0..len]) catch null;
}

fn detectDistRoot(allocator: std.mem.Allocator) ![]const u8 {
    const exe_path = getOwnExePath(allocator) orelse return error.ExePathNotFound;
    defer allocator.free(exe_path);

    const exe_dir = std.fs.path.dirname(exe_path) orelse ".";

    const prod_path = try std.fs.path.join(allocator, &.{ exe_dir, "dist" });
    errdefer allocator.free(prod_path);

    const prod_check = try std.fs.path.join(allocator, &.{ prod_path, "index.html" });
    defer allocator.free(prod_check);
    const prod_check_z = try allocator.dupeZ(u8, prod_check);
    defer allocator.free(prod_check_z);

    if (fopen(prod_check_z.ptr, "rb")) |fh| {
        _ = fclose(fh);
        return prod_path;
    }
    allocator.free(prod_path);

    const dev_path = try std.fs.path.join(allocator, &.{ exe_dir, "..\\..\\dist" });
    errdefer allocator.free(dev_path);

    const dev_check = try std.fs.path.join(allocator, &.{ dev_path, "index.html" });
    defer allocator.free(dev_check);
    const dev_check_z = try allocator.dupeZ(u8, dev_check);
    defer allocator.free(dev_check_z);

    if (fopen(dev_check_z.ptr, "rb")) |fh| {
        _ = fclose(fh);
        return dev_path;
    }
    allocator.free(dev_path);

    return try allocator.dupe(u8, "dist");
}

fn mimeType(path: []const u8) []const u8 {
    if (std.mem.endsWith(u8, path, ".html") or std.mem.endsWith(u8, path, ".htm")) return "text/html; charset=utf-8";
    if (std.mem.endsWith(u8, path, ".css"))   return "text/css; charset=utf-8";
    if (std.mem.endsWith(u8, path, ".js"))    return "text/javascript; charset=utf-8";
    if (std.mem.endsWith(u8, path, ".json"))  return "application/json";
    if (std.mem.endsWith(u8, path, ".png"))   return "image/png";
    if (std.mem.endsWith(u8, path, ".jpg") or std.mem.endsWith(u8, path, ".jpeg")) return "image/jpeg";
    if (std.mem.endsWith(u8, path, ".svg"))   return "image/svg+xml";
    if (std.mem.endsWith(u8, path, ".woff2")) return "font/woff2";
    if (std.mem.endsWith(u8, path, ".ico"))   return "image/x-icon";
    return "application/octet-stream";
}

fn scanAndCacheDir(allocator: std.mem.Allocator, map: *std.StringHashMap(CachedFile), dir_path: []const u8) !void {
    const search_pattern = try std.fmt.allocPrint(allocator, "{s}\\*", .{dir_path});
    defer allocator.free(search_pattern);
    const search_pattern_z = try allocator.dupeZ(u8, search_pattern);
    defer allocator.free(search_pattern_z);

    var find_data: win32_find.WIN32_FIND_DATAA = undefined;
    const hFind = win32_find.FindFirstFileA(search_pattern_z.ptr, &find_data);
    if (hFind == win32_find.INVALID_HANDLE_VALUE) return;
    defer _ = win32_find.FindClose(hFind);

    while (true) {
        const name_len = std.mem.len(@as([*:0]const u8, @ptrCast(&find_data.cFileName)));
        const name = find_data.cFileName[0..name_len];

        if (!std.mem.eql(u8, name, ".") and !std.mem.eql(u8, name, "..")) {
            const sub_path = try std.fmt.allocPrint(allocator, "{s}\\{s}", .{ dir_path, name });
            defer allocator.free(sub_path);

            if ((find_data.dwFileAttributes & 0x10) != 0) {
                try scanAndCacheDir(allocator, map, sub_path);
            } else {
                const sub_path_z = try allocator.dupeZ(u8, sub_path);
                defer allocator.free(sub_path_z);

                if (fopen(sub_path_z.ptr, "rb")) |fh| {
                    defer _ = fclose(fh);
                    _ = fseek(fh, 0, 2);
                    const file_size: usize = @intCast(ftell(fh));
                    _ = fseek(fh, 0, 0);

                    const content = try allocator.alloc(u8, file_size);
                    errdefer allocator.free(content);
                    _ = fread(content.ptr, 1, file_size, fh);

                    if (std.mem.indexOf(u8, sub_path, UI_ROOT)) |ui_idx| {
                        const rel_path = sub_path[ui_idx + UI_ROOT.len ..];
                        const web_path_buf = try allocator.alloc(u8, rel_path.len);
                        errdefer allocator.free(web_path_buf);
                        std.mem.copyForwards(u8, web_path_buf, rel_path);
                        for (web_path_buf) |*c| {
                            if (c.* == '\\') c.* = '/';
                        }

                        const mime = try allocator.dupe(u8, mimeType(web_path_buf));
                        errdefer allocator.free(mime);

                        const cached = CachedFile{ .content = content, .mime = mime };
                        try map.put(web_path_buf, cached);
                    }
                }
            }
        }

        if (win32_find.FindNextFileA(hFind, &find_data) == 0) break;
    }
}

fn populateStaticFilesCache(allocator: std.mem.Allocator) !void {
    var map = std.StringHashMap(CachedFile).init(allocator);
    errdefer {
        var it = map.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*.content);
            allocator.free(entry.value_ptr.*.mime);
        }
        map.deinit();
    }
    try scanAndCacheDir(allocator, &map, UI_ROOT);
    g_static_files = map;
}

// ─── Connection handler ───────────────────────────────────────────────────────
const ConnCtx = struct { sock: usize, allocator: std.mem.Allocator };

fn handleConnection(ctx: ConnCtx) void {
    defer _ = closesocket(ctx.sock);
    const allocator = ctx.allocator;

    var req_buf: [8192]u8 = undefined;
    const n = recv(ctx.sock, &req_buf, @intCast(req_buf.len), 0);
    if (n <= 0) return;

    const request_str = req_buf[0..@intCast(n)];
    var req_lines = std.mem.splitSequence(u8, request_str, "\r\n");
    const first_line = req_lines.next() orelse return;
    var parts = std.mem.splitScalar(u8, first_line, ' ');
    _ = parts.next();
    var url_path = parts.next() orelse "/";

    if (std.mem.indexOfScalar(u8, url_path, '?')) |qi| url_path = url_path[0..qi];
    if (std.mem.eql(u8, url_path, "/")) url_path = "/index.html";

    if (g_static_files.get(url_path)) |cached| {
        const cache_control = "no-cache, no-store, must-revalidate";
        const header = std.fmt.allocPrint(allocator,
            "HTTP/1.1 200 OK\r\nContent-Type: {s}\r\nContent-Length: {d}\r\nAccess-Control-Allow-Origin: *\r\nCache-Control: {s}\r\nConnection: keep-alive\r\n\r\n",
            .{ cached.mime, cached.content.len, cache_control }) catch return;
        defer allocator.free(header);
        _ = send(ctx.sock, header.ptr, @intCast(header.len), 0);
        _ = send(ctx.sock, cached.content.ptr, @intCast(cached.content.len), 0);
        return;
    }

    // 1. Try disk path relative to UI_ROOT (e.g. dist/index.html or dist/assets/...)
    var full_disk_path_buf: [1024]u8 = undefined;
    const full_disk_path = std.fmt.bufPrint(&full_disk_path_buf, "{s}{s}", .{ UI_ROOT, url_path }) catch "";
    for (full_disk_path_buf[0..full_disk_path.len]) |*c| {
        if (c.* == '/') c.* = '\\';
    }

    if (allocator.dupeZ(u8, full_disk_path) catch null) |zpath| {
        defer allocator.free(zpath);
        if (fopen(zpath.ptr, "rb")) |fh| {
            defer _ = fclose(fh);
            _ = fseek(fh, 0, 2);
            const fsz: usize = @intCast(ftell(fh));
            _ = fseek(fh, 0, 0);

            if (allocator.alloc(u8, fsz) catch null) |disk_content| {
                defer allocator.free(disk_content);
                _ = fread(disk_content.ptr, 1, fsz, fh);
                const mime = mimeType(url_path);
                const header = std.fmt.allocPrint(allocator,
                    "HTTP/1.1 200 OK\r\nContent-Type: {s}\r\nContent-Length: {d}\r\nAccess-Control-Allow-Origin: *\r\nCache-Control: no-cache\r\nConnection: keep-alive\r\n\r\n",
                    .{ mime, disk_content.len }) catch null;
                if (header) |hdr| {
                    defer allocator.free(hdr);
                    _ = send(ctx.sock, hdr.ptr, @intCast(hdr.len), 0);
                    _ = send(ctx.sock, disk_content.ptr, @intCast(disk_content.len), 0);
                    return;
                }
            }
        }
    }

    // 2. Direct absolute disk fallback for imported local email images (e.g. /C:/Users/... or /output (5)/assets/...)
    var raw_disk_path = url_path;
    if (std.mem.startsWith(u8, raw_disk_path, "/")) raw_disk_path = raw_disk_path[1..];

    // Decode URL %20 spaces and %2F slashes
    var decoded_buf: [1024]u8 = undefined;
    var d_len: usize = 0;
    var idx: usize = 0;
    while (idx < raw_disk_path.len and d_len < decoded_buf.len) {
        if (idx + 2 < raw_disk_path.len and raw_disk_path[idx] == '%' and raw_disk_path[idx+1] == '2') {
            if (raw_disk_path[idx+2] == '0') {
                decoded_buf[d_len] = ' ';
                idx += 3;
            } else if (raw_disk_path[idx+2] == 'F' or raw_disk_path[idx+2] == 'f') {
                decoded_buf[d_len] = '\\';
                idx += 3;
            } else {
                decoded_buf[d_len] = raw_disk_path[idx];
                idx += 1;
            }
        } else {
            const ch = raw_disk_path[idx];
            decoded_buf[d_len] = if (ch == '/') '\\' else ch;
            idx += 1;
        }
        d_len += 1;
    }
    const clean_abs_path = decoded_buf[0..d_len];

    if (allocator.dupeZ(u8, clean_abs_path) catch null) |abs_zpath| {
        defer allocator.free(abs_zpath);
        if (fopen(abs_zpath.ptr, "rb")) |fh| {
            defer _ = fclose(fh);
            _ = fseek(fh, 0, 2);
            const fsz: usize = @intCast(ftell(fh));
            _ = fseek(fh, 0, 0);

            if (allocator.alloc(u8, fsz) catch null) |disk_content| {
                defer allocator.free(disk_content);
                _ = fread(disk_content.ptr, 1, fsz, fh);
                const mime = mimeType(clean_abs_path);
                const header = std.fmt.allocPrint(allocator,
                    "HTTP/1.1 200 OK\r\nContent-Type: {s}\r\nContent-Length: {d}\r\nAccess-Control-Allow-Origin: *\r\nCache-Control: no-cache\r\nConnection: keep-alive\r\n\r\n",
                    .{ mime, disk_content.len }) catch null;
                if (header) |hdr| {
                    defer allocator.free(hdr);
                    _ = send(ctx.sock, hdr.ptr, @intCast(hdr.len), 0);
                    _ = send(ctx.sock, disk_content.ptr, @intCast(disk_content.len), 0);
                    return;
                }
            }
        }
    }

    if (g_static_files.get("/index.html")) |cached| {
        const header = std.fmt.allocPrint(allocator,
            "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {d}\r\nCache-Control: no-cache\r\nConnection: keep-alive\r\n\r\n",
            .{cached.content.len}) catch return;
        defer allocator.free(header);
        _ = send(ctx.sock, header.ptr, @intCast(header.len), 0);
        _ = send(ctx.sock, cached.content.ptr, @intCast(cached.content.len), 0);
        return;
    }

    const not_found = "HTTP/1.1 404 Not Found\r\nContent-Length: 9\r\nConnection: close\r\n\r\nNot Found";
    _ = send(ctx.sock, not_found.ptr, @intCast(not_found.len), 0);
}

fn connectionThread(ctx: ConnCtx) void { handleConnection(ctx); }

const ServerCtx = struct { allocator: std.mem.Allocator };

fn runServer(ctx: *ServerCtx) void {
    var wsdata: WSADATA = undefined;
    _ = WSAStartup(0x0202, &wsdata);
    defer _ = WSACleanup();

    const srv = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (srv == INVALID_SOCKET) return;
    defer _ = closesocket(srv);

    const yes: c_int = 1;
    _ = setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &yes, @sizeOf(c_int));

    var addr = SOCKADDR_IN{
        .sin_family = AF_INET,
        .sin_port = htons(LOCAL_SERVER_PORT),
        .sin_addr = htonl(0x7F000001),
        .sin_zero = [_]u8{0} ** 8,
    };
    if (bind(srv, &addr, @sizeOf(SOCKADDR_IN)) == SOCKET_ERROR) return;
    if (listen(srv, 128) == SOCKET_ERROR) return;

    while (true) {
        const client = accept(srv, null, null);
        if (client == INVALID_SOCKET) continue;
        const conn_ctx = ConnCtx{ .sock = client, .allocator = ctx.allocator };
        const t = std.Thread.spawn(.{}, connectionThread, .{conn_ctx}) catch {
            _ = closesocket(client);
            continue;
        };
        t.detach();
    }
}

fn toUtf16(allocator: std.mem.Allocator, utf8: []const u8) ![:0]u16 {
    const len = try std.unicode.utf8CountCodepoints(utf8);
    const buf = try allocator.alloc(u16, len + 1);
    errdefer allocator.free(buf);
    _ = try std.unicode.utf8ToUtf16Le(buf[0..len], utf8);
    buf[len] = 0;
    return buf[0..len:0];
}

// ─── Child → Parent IPC relay ────────────────────────────────────────────────
// Called by C++ WebMessageReceivedHandler when child webview does
// chrome.webview.postMessage(json). We eval it into the parent webview JS.
fn childIpcRelay(msg: [*:0]const u8) callconv(.c) void {
    const mw = g_main_webview orelse return;
    const allocator = std.heap.page_allocator;
    const msg_slice = std.mem.span(msg);
    // Inject the raw JSON directly — canvas-runner always sends JSON.stringify output
    const js = std.fmt.allocPrint(allocator,
        "if(window.__onChildMessage){{try{{window.__onChildMessage({s})}}catch(e){{}}}}",
        .{msg_slice}) catch return;
    defer allocator.free(js);
    const js_z = allocator.dupeZ(u8, js) catch return;
    defer allocator.free(js_z);
    mw.eval(js_z) catch {};
}

// ─── Native Webview Bindings for Child WebView Controls ──
fn initChildWebviewIPC(w: *Webview) !void {
    g_main_webview = w;
    // Register the relay so messages from the child canvas reach the parent
    child_webview_set_relay_fn(@constCast(@ptrCast(&childIpcRelay)));

    // 1. init_child_canvas: Spawns the child native WebView2 window
    try w.bindSimple("init_child_canvas", struct {
        fn cb(seq: []const u8, req: []const u8) void {
            _ = seq; _ = req;
            if (g_child_webview_handle == null and g_parent_hwnd != null) {
                child_webview_preinit(g_parent_hwnd);
                g_child_webview_handle = child_webview_create(g_parent_hwnd, "about:blank", "canvas_view");
            }
        }
    }.cb);

    // show_native_confirm: Pops up a topmost Win32 MessageBoxW dialog box to confirm Start New Email
    try w.bindSimple("show_native_confirm", struct {
        fn cb(seq: []const u8, req: []const u8) void {
            _ = seq;
            const allocator = std.heap.page_allocator;
            const parsed = std.json.parseFromSlice([]const []const u8, allocator, req, .{}) catch return;
            defer parsed.deinit();
            if (parsed.value.len > 1) {
                const title = parsed.value[0];
                const msg = parsed.value[1];

                const title_w = toUtf16(allocator, title) catch return;
                defer allocator.free(title_w);
                const msg_w = toUtf16(allocator, msg) catch return;
                defer allocator.free(msg_w);

                const MB_YESNO = 0x00000004;
                const MB_ICONQUESTION = 0x00000020;
                const MB_TOPMOST = 0x00040000;
                const IDYES = 6;

                const win32 = struct {
                    extern "user32" fn MessageBoxW(
                        hWnd: ?*anyopaque,
                        lpText: [*:0]const u16,
                        lpCaption: [*:0]const u16,
                        uType: u32,
                    ) callconv(.winapi) c_int;
                };

                const result = win32.MessageBoxW(
                    g_parent_hwnd,
                    msg_w.ptr,
                    title_w.ptr,
                    MB_YESNO | MB_ICONQUESTION | MB_TOPMOST,
                );

                if (result == IDYES) {
                    if (g_main_webview) |mw| {
                        mw.eval("new BroadcastChannel('webview_ipc').postMessage({ type: 'confirm-erase-action' });") catch {};
                    }
                }
            }
        }
    }.cb);

    // 1.5 open_file_dialog: Opens Windows native IFileDialog to return full path and content
    try w.bindSimple("open_file_dialog", struct {
        fn cb(seq: []const u8, req: []const u8) void {
            _ = seq; _ = req;
            const allocator = std.heap.page_allocator;
            const win32 = struct {
                extern "comdlg32" fn GetOpenFileNameW(lpofn: *anyopaque) callconv(.winapi) i32;
            };

            var filename: [512]u16 = std.mem.zeroes([512]u16);
            const OPENFILENAMEW = extern struct {
                lStructSize: u32,
                hwndOwner: ?*anyopaque,
                hInstance: ?*anyopaque,
                lpstrFilter: ?[*:0]const u16,
                lpstrCustomFilter: ?*u16,
                nMaxCustFilter: u32,
                nFilterIndex: u32,
                lpstrFile: [*]u16,
                nMaxFile: u32,
                lpstrFileTitle: ?[*]u16,
                nMaxFileTitle: u32,
                lpstrInitialDir: ?[*:0]const u16,
                lpstrTitle: ?[*:0]const u16,
                Flags: u32,
                nFileOffset: u16,
                nFileExtension: u16,
                lpstrDefExt: ?[*:0]const u16,
                lCustData: usize,
                lpfnHook: ?*anyopaque,
                lpTemplateName: ?[*:0]const u16,
            };

            const filter_w = &[_:0]u16{'H','T','M','L',' ','F','i','l','e','s','\x00','*','.','h','t','m','l',';','*','.','h','t','m','\x00','A','l','l',' ','F','i','l','e','s','\x00','*','.','*','\x00','\x00'};
            const title_w = &[_:0]u16{'S','e','l','e','c','t',' ','H','T','M','L',' ','T','e','m','p','l','a','t','e','\x00'};

            var ofn = std.mem.zeroes(OPENFILENAMEW);
            ofn.lStructSize = @sizeOf(OPENFILENAMEW);
            ofn.hwndOwner = g_parent_hwnd;
            ofn.lpstrFilter = @ptrCast(filter_w);
            ofn.lpstrFile = &filename;
            ofn.nMaxFile = 512;
            ofn.lpstrTitle = @ptrCast(title_w);
            ofn.Flags = 0x00080000 | 0x00001000 | 0x00000008;

            if (win32.GetOpenFileNameW(&ofn) != 0) {
                var len: usize = 0;
                while (len < filename.len and filename[len] != 0) : (len += 1) {}
                const full_path_u16 = filename[0..len];

                // Convert to UTF-8
                const u8_len = std.unicode.utf16LeToUtf8Alloc(allocator, full_path_u16) catch return;
                defer allocator.free(u8_len);

                const u8_path_z = allocator.dupeZ(u8, u8_len) catch return;
                defer allocator.free(u8_path_z);

                if (fopen(u8_path_z.ptr, "rb")) |fh| {
                    defer _ = fclose(fh);
                    _ = fseek(fh, 0, 2);
                    const fsz: usize = @intCast(ftell(fh));
                    _ = fseek(fh, 0, 0);

                    if (allocator.alloc(u8, fsz) catch null) |html_content| {
                        defer allocator.free(html_content);
                        _ = fread(html_content.ptr, 1, fsz, fh);

                        // Escape Windows backslashes in path string for JS string evaluation
                        var js_path_buf = std.ArrayListUnmanaged(u8).empty;
                        defer js_path_buf.deinit(allocator);
                        for (u8_len) |ch| {
                            if (ch == '\\') {
                                js_path_buf.appendSlice(allocator, "\\\\") catch {};
                            } else {
                                js_path_buf.append(allocator, ch) catch {};
                            }
                        }

                        const escaped_path = std.fmt.allocPrint(allocator, "\"{s}\"", .{js_path_buf.items}) catch return;
                        defer allocator.free(escaped_path);

                        // Base64 encode html content to prevent JSON escaping errors
                        const base64_len = std.base64.standard.Encoder.calcSize(html_content.len);
                        const base64_buf = allocator.alloc(u8, base64_len) catch return;
                        defer allocator.free(base64_buf);
                        _ = std.base64.standard.Encoder.encode(base64_buf, html_content);

                        const js = std.fmt.allocPrint(allocator,
                            "if(window.__onNativeFileSelected){{window.__onNativeFileSelected({{path:{s},content:\"{s}\"}})}}",
                            .{escaped_path, base64_buf}) catch return;
                        defer allocator.free(js);

                        const js_z = allocator.dupeZ(u8, js) catch return;
                        defer allocator.free(js_z);

                        if (g_main_webview) |mw| {
                            mw.eval(js_z) catch {};
                        }
                    }
                }
            }
        }
    }.cb);

    // 2. sync_child_bounds: Resizes and repositions the child WebView2 window to match the DOM canvas div
    try w.bindSimple("sync_child_bounds", struct {
        fn cb(seq: []const u8, req: []const u8) void {
            _ = seq;
            if (g_child_webview_handle == null) return;

            var x: c_int = 0;
            var y: c_int = 0;
            var w_val: c_int = 660;
            var h_val: c_int = 600;
            var visible: bool = true;
            var layout_w: c_int = 660;

            const allocator = std.heap.page_allocator;
            const parsed = std.json.parseFromSlice([]const []const u8, allocator, req, .{}) catch return;
            defer parsed.deinit();

            if (parsed.value.len > 0) {
                var it = std.mem.splitScalar(u8, parsed.value[0], ',');
                if (it.next()) |xs| x = std.fmt.parseInt(c_int, std.mem.trim(u8, xs, " "), 10) catch 0;
                if (it.next()) |ys| y = std.fmt.parseInt(c_int, std.mem.trim(u8, ys, " "), 10) catch 0;
                if (it.next()) |ws| w_val = std.fmt.parseInt(c_int, std.mem.trim(u8, ws, " "), 10) catch 660;
                if (it.next()) |hs| h_val = std.fmt.parseInt(c_int, std.mem.trim(u8, hs, " "), 10) catch 600;
                if (it.next()) |vs| visible = std.mem.startsWith(u8, std.mem.trim(u8, vs, " "), "true");
                if (it.next()) |lws| layout_w = std.fmt.parseInt(c_int, std.mem.trim(u8, lws, " "), 10) catch w_val;
            }

            child_webview_set_bounds(g_child_webview_handle, x, y, w_val, h_val, visible, layout_w);
        }
    }.cb);

    // 3. update_child_html: Renders standard template HTML directly via NavigateToString
    try w.bindSimple("update_child_html", struct {
        fn cb(seq: []const u8, req: []const u8) void {
            _ = seq;
            if (g_child_webview_handle == null) return;
            const allocator = std.heap.page_allocator;
            const parsed = std.json.parseFromSlice([]const []const u8, allocator, req, .{}) catch {
                const html_z = allocator.dupeZ(u8, req) catch return;
                defer allocator.free(html_z);
                child_webview_navigate_to_string(g_child_webview_handle, html_z.ptr);
                return;
            };
            defer parsed.deinit();
            if (parsed.value.len > 0) {
                const html_z = allocator.dupeZ(u8, parsed.value[0]) catch return;
                defer allocator.free(html_z);
                child_webview_navigate_to_string(g_child_webview_handle, html_z.ptr);
            }
        }
    }.cb);

    // save_file_to_disk: Writes updated HTML content directly back to local file on disk
    try w.bindSimple("save_file_to_disk", struct {
        fn cb(seq: []const u8, req: []const u8) void {
            _ = seq;
            const allocator = std.heap.page_allocator;
            const parsed = std.json.parseFromSlice([]const []const u8, allocator, req, .{}) catch return;
            defer parsed.deinit();
            if (parsed.value.len > 1) {
                const path = parsed.value[0];
                const content = parsed.value[1];

                const path_z = allocator.dupeZ(u8, path) catch return;
                defer allocator.free(path_z);

                if (fopen(path_z.ptr, "wb")) |fh| {
                    defer _ = fclose(fh);
                    _ = fwrite(content.ptr, 1, content.len, fh);
                }
            }
        }
    }.cb);

    // eval_child_js: Executes JS in the child WebView2 instance
    try w.bindSimple("eval_child_js", struct {
        fn cb(seq: []const u8, req: []const u8) void {
            _ = seq;
            if (g_child_webview_handle == null) return;
            const allocator = std.heap.page_allocator;
            const parsed = std.json.parseFromSlice([]const []const u8, allocator, req, .{}) catch {
                const js_z = allocator.dupeZ(u8, req) catch return;
                defer allocator.free(js_z);
                child_webview_eval(g_child_webview_handle, js_z.ptr);
                return;
            };
            defer parsed.deinit();
            if (parsed.value.len > 0) {
                const js_z = allocator.dupeZ(u8, parsed.value[0]) catch return;
                defer allocator.free(js_z);
                child_webview_eval(g_child_webview_handle, js_z.ptr);
            }
        }
    }.cb);

    // 4. init_popup_webview: Spawns a secondary native child webview for popups/editors
    try w.bindSimple("init_popup_webview", struct {
        fn cb(seq: []const u8, req: []const u8) void {
            _ = seq;
            if (g_parent_hwnd == null) return;
            if (g_popup_webview_handle != null) {
                child_webview_destroy(g_popup_webview_handle);
                g_popup_webview_handle = null;
            }
            const allocator = std.heap.page_allocator;
            const parsed = std.json.parseFromSlice([]const []const u8, allocator, req, .{}) catch return;
            defer parsed.deinit();
            if (parsed.value.len > 0) {
                const url_z = allocator.dupeZ(u8, parsed.value[0]) catch return;
                defer allocator.free(url_z);
                g_popup_webview_handle = child_webview_create(g_parent_hwnd, url_z.ptr, "popup_view");
            }
        }
    }.cb);

    // 5. sync_popup_bounds: Sizes and positions the popup child webview
    try w.bindSimple("sync_popup_bounds", struct {
        fn cb(seq: []const u8, req: []const u8) void {
            _ = seq;
            if (g_popup_webview_handle == null) return;
            var x: c_int = 0;
            var y: c_int = 0;
            var w_val: c_int = 800;
            var h_val: c_int = 600;
            var visible: bool = true;
            var layout_w: c_int = 800;

            const allocator = std.heap.page_allocator;
            const parsed = std.json.parseFromSlice([]const []const u8, allocator, req, .{}) catch return;
            defer parsed.deinit();

            if (parsed.value.len > 0) {
                var it = std.mem.splitScalar(u8, parsed.value[0], ',');
                if (it.next()) |xs| x = std.fmt.parseInt(c_int, std.mem.trim(u8, xs, " "), 10) catch 0;
                if (it.next()) |ys| y = std.fmt.parseInt(c_int, std.mem.trim(u8, ys, " "), 10) catch 0;
                if (it.next()) |ws| w_val = std.fmt.parseInt(c_int, std.mem.trim(u8, ws, " "), 10) catch 800;
                if (it.next()) |hs| h_val = std.fmt.parseInt(c_int, std.mem.trim(u8, hs, " "), 10) catch 600;
                if (it.next()) |vs| visible = std.mem.startsWith(u8, std.mem.trim(u8, vs, " "), "true");
                if (it.next()) |lws| layout_w = std.fmt.parseInt(c_int, std.mem.trim(u8, lws, " "), 10) catch w_val;
            }

            child_webview_set_bounds(g_popup_webview_handle, x, y, w_val, h_val, visible, layout_w);
        }
    }.cb);

    // 6. close_popup_webview: Destroys the popup child webview
    try w.bindSimple("close_popup_webview", struct {
        fn cb(seq: []const u8, req: []const u8) void {
            _ = seq; _ = req;
            if (g_popup_webview_handle) |handle| {
                child_webview_destroy(handle);
                g_popup_webview_handle = null;
            }
        }
    }.cb);
}

// ─── Entry point ──────────────────────────────────────────────────────────────
pub fn main() !void {
    // ─── Enable Per-Monitor High-DPI Awareness ───
    const dpi_win = struct {
        extern "user32" fn SetProcessDpiAwarenessContext(value: ?*anyopaque) callconv(.winapi) bool;
    };
    _ = dpi_win.SetProcessDpiAwarenessContext(@ptrFromInt(@as(usize, @bitCast(@as(isize, -4)))));

    const allocator = std.heap.page_allocator;

    if (detectDistRoot(allocator)) |detected| {
        UI_ROOT = detected;
    } else |_| {
        UI_ROOT = "dist";
    }

    g_static_files = std.StringHashMap(CachedFile).init(allocator);

    var server_ctx = ServerCtx{ .allocator = allocator };
    const server_thread = try std.Thread.spawn(.{}, runServer, .{&server_ctx});
    server_thread.detach();

    // Populate static files cache asynchronously in background so app UI opens in <100ms
    const cache_thread = try std.Thread.spawn(.{}, struct {
        fn run(alloc: std.mem.Allocator) void {
            populateStaticFilesCache(alloc) catch {};
        }
    }.run, .{allocator});
    cache_thread.detach();

    // Fast-initialize WebView2 container (bound to local loopback 127.0.0.1 - zero firewall prompts)
    var w = try Webview.create(true, null);
    defer w.destroy() catch {};

    g_parent_hwnd = w.getNativeHandle(.ui_window);
    try initChildWebviewIPC(w);

    // Subclass main window to run custom message processing
    const user32_sub = struct {
        extern "user32" fn SetWindowLongPtrA(hWnd: ?*anyopaque, nIndex: c_int, dwNewLong: isize) callconv(.winapi) isize;
    };

    g_original_wndproc = @ptrFromInt(@as(usize, @bitCast(user32_sub.SetWindowLongPtrA(g_parent_hwnd, -4, @intCast(@intFromPtr(&customWndProc))))));

    // Pre-initialize child WebView2 environment with parent window handle
    child_webview_preinit(g_parent_hwnd);

    try w.setTitle("ContentGen Studio");
    try w.setSize(1400, 900, .none);
    try w.navigate("http://127.0.0.1:9732");
    try w.run();
}

var g_original_wndproc: ?*anyopaque = null;

fn customWndProc(hwnd: ?*anyopaque, msg: u32, wparam: usize, lparam: usize) callconv(.winapi) isize {
    const user32_call = struct {
        extern "user32" fn CallWindowProcA(lpPrevWndFunc: ?*anyopaque, hWnd: ?*anyopaque, Msg: u32, wParam: usize, lParam: usize) callconv(.winapi) isize;
    };
    // Let the main webview handle all standard window events
    return user32_call.CallWindowProcA(g_original_wndproc.?, hwnd, msg, wparam, lparam);
}
