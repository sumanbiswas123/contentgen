const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const webview_dep = b.dependency("webview", .{
        .target = target,
        .optimize = optimize,
    });

    const exe = b.addExecutable(.{
        .name = "contentgen",
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/main.zig"),
            .target = target,
            .optimize = optimize,
        }),
    });

    exe.subsystem = .Windows;
    exe.root_module.addImport("webview", webview_dep.module("webview"));

    exe.root_module.addIncludePath(b.path("third_party/webview2"));
    exe.root_module.addCSourceFile(.{
        .file = b.path("src/child_webview.cpp"),
        .flags = &.{ "-std=c++20" },
    });
    exe.root_module.link_libcpp = true;
    exe.root_module.linkSystemLibrary("ole32", .{});
    exe.root_module.linkSystemLibrary("oleaut32", .{});
    exe.root_module.linkSystemLibrary("user32", .{});
    exe.root_module.linkSystemLibrary("gdi32", .{});
    exe.root_module.linkSystemLibrary("dwmapi", .{});
    exe.root_module.linkSystemLibrary("dcomp", .{});

    b.installArtifact(exe);

    // Copy the Vite dist/ bundle next to the exe so it can be found at runtime
    const install_dist = b.addInstallDirectory(.{
        .source_dir = b.path("dist"),
        .install_dir = .bin,
        .install_subdir = "dist",
    });
    b.getInstallStep().dependOn(&install_dist.step);

    const run = b.addRunArtifact(exe);
    const run_step = b.step("run", "Run ContentGen Native application");
    run_step.dependOn(&run.step);
}
