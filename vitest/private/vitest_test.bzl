"Implementation details for vitest_test rule"

load("@aspect_bazel_lib//lib:copy_to_bin.bzl", "copy_file_to_bin_action")
load("@aspect_rules_js//js:libs.bzl", "js_binary_lib", "js_lib_helpers")
load("@bazel_skylib//lib:dicts.bzl", "dicts")
load("@bazel_skylib//lib:paths.bzl", "paths")

_attrs = dicts.add(js_binary_lib.attrs, {
    "config": attr.label(allow_single_file = [".js", ".ts", ".cjs", ".mjs", ".mts", ".json"]),
    "auto_configure_reporters": attr.bool(default = True),
    "auto_configure_test_sequencer": attr.bool(default = True),
    "coverage_provider": attr.string(default = "istanbul"),
    "update_snapshots": attr.bool(default = False),
    "quiet_snapshot_updates": attr.bool(default = False),
    "entry_point": attr.label(mandatory = True),
    "bazel_sequencer": attr.label(
        allow_single_file = True,
        mandatory = True,
    ),
    "bazel_snapshot_reporter": attr.label(
        allow_single_file = True,
        mandatory = True,
    ),
    "bazel_snapshot_resolver": attr.label(
        allow_single_file = True,
        mandatory = True,
    ),
    "env_inherit": attr.string_list(
        doc = """Environment variables to inherit from the external environment.""",
    ),
    "_vitest_config_template": attr.label(
        allow_single_file = True,
        default = Label("//vitest/private:vitest_config_template.mjs"),
    ),
    # Earlier versions of Bazel expect this attribute to be present.
    # https://github.com/bazelbuild/bazel/issues/13978
    # We use a no-op because vitest itself generates the coverage.
    "_lcov_merger": attr.label(
        executable = True,
        default = Label("//vitest/private:merger"),
        cfg = "exec",
    ),
})

def _impl(ctx):
    providers = []
    generated_config = ctx.actions.declare_file("%s__vitest.config.mjs" % ctx.label.name)
    user_config = copy_file_to_bin_action(ctx, ctx.file.config) if ctx.attr.config else None

    ctx.actions.expand_template(
        template = ctx.file._vitest_config_template,
        output = generated_config,
        substitutions = {
            "{{GENERATED_CONFIG_SHORT_PATH}}": generated_config.short_path,
            "{{USER_CONFIG_SHORT_PATH}}": user_config.short_path if user_config else "",
            "{{AUTO_CONF_REPORTERS}}": "1" if ctx.attr.auto_configure_reporters else "",
            "{{AUTO_CONF_TEST_SEQUENCER}}": "1" if ctx.attr.auto_configure_test_sequencer else "",
            "{{COVERAGE_PROVIDER}}": ctx.attr.coverage_provider,
            "{{BAZEL_SEQUENCER_SHORT_PATH}}": ctx.file.bazel_sequencer.short_path,
            "{{BAZEL_SNAPSHOT_REPORTER_SHORT_PATH}}": ctx.file.bazel_snapshot_reporter.short_path,
            "{{BAZEL_SNAPSHOT_RESOLVER_SHORT_PATH}}": ctx.file.bazel_snapshot_resolver.short_path,
        },
    )

    fixed_args = []

    # Unwind the chdir argument to adapt the path arguments
    unwind_chdir_prefix = ""
    if ctx.attr.chdir:
        unwind_chdir_prefix = "/".join([".."] * len(ctx.attr.chdir.split("/"))) + "/"

    path_to_test_config_dir = paths.dirname(paths.join(unwind_chdir_prefix, generated_config.short_path))
    if path_to_test_config_dir != "":
        # Tell Vitest to look for tests in the directory where the test config is located
        fixed_args.extend([
            "--dir",
            "'" + paths.dirname(paths.join(unwind_chdir_prefix, generated_config.short_path)) + "'",
        ])

    # TODO(1.0): we can assume fixed_args exists on attr for the 1.0 release (it comes from rules_js 1.27.0)
    if hasattr(ctx.attr, "fixed_args"):
        fixed_args.extend(ctx.attr.fixed_args)
    fixed_args.extend([
        "--run",
        # Bazel does the caching
        "--cache=false",
        "--config",
        # quote the path since it might have special chars such as parens.
        # quoting ensures that the shell doesn't do any globbing or splitting.
        "'" + paths.join(unwind_chdir_prefix, generated_config.short_path) + "'",
    ])

    fixed_env = {}

    if ctx.attr.update_snapshots:
        fixed_args.append("--update=true")
        fixed_env["VITEST_TEST__UPDATE_SNAPSHOTS"] = "true"

    if ctx.attr.quiet_snapshot_updates:
        fixed_env["JS_BINARY__SILENT_ON_SUCCESS"] = "1"

    fixed_args.extend([
        "--shard",
        "1/1",  # NOT IN USE, but required by vitest. Actual value resolved in BazelSequencer
    ])

    launcher = js_binary_lib.create_launcher(
        ctx,
        log_prefix_rule_set = "fremtind_rules_vitest",
        log_prefix_rule = "vitest_test",
        fixed_args = fixed_args,
        fixed_env = fixed_env,
    )

    files = ctx.files.data[:]
    if user_config:
        files.append(user_config)
    files.append(generated_config)
    files.append(ctx.file.bazel_sequencer)
    files.append(ctx.file.bazel_snapshot_reporter)
    files.append(ctx.file.bazel_snapshot_resolver)

    runfiles = ctx.runfiles(
        files = files,
        transitive_files = js_lib_helpers.gather_files_from_js_infos(
            targets = ctx.attr.data + [ctx.attr.config] if ctx.attr.config else ctx.attr.data,
            include_sources = ctx.attr.include_sources,
            include_types = ctx.attr.include_types,
            include_transitive_sources = ctx.attr.include_transitive_sources,
            include_transitive_types = ctx.attr.include_transitive_types,
            include_npm_sources = ctx.attr.include_npm_sources,
        ),
    ).merge(launcher.runfiles).merge_all([
        target[DefaultInfo].default_runfiles
        for target in ctx.attr.data
    ])

    if ctx.attr.config and ctx.attr.config[DefaultInfo]:
        runfiles = runfiles.merge(ctx.attr.config[DefaultInfo].default_runfiles)

    if ctx.configuration.coverage_enabled:
        providers.append(
            coverage_common.instrumented_files_info(
                ctx,
                source_attributes = ["data"],
                extensions = [
                    "cjs",
                    "cjx",
                    "cts",
                    "ctx",
                    "js",
                    "jsx",
                    "mjs",
                    "mjx",
                    "mts",
                    "mtx",
                    "ts",
                    "tsx",
                ],
            ),
        )

    providers.append(
        DefaultInfo(
            executable = launcher.executable,
            runfiles = runfiles,
        ),
    )

    if ctx.attr.env_inherit != None:
        providers.append(
            testing.TestEnvironment(fixed_env, ctx.attr.env_inherit),
        )

    return providers

lib = struct(
    attrs = _attrs,
    implementation = _impl,
)

vitest_test = rule(
    attrs = lib.attrs,
    implementation = lib.implementation,
    test = True,
    toolchains = js_binary_lib.toolchains,
)
