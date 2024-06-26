<!-- Generated with Stardoc: http://skydoc.bazel.build -->

# Public API for Vitest rules


<a id="vitest_test"></a>

## vitest_test

<pre>
vitest_test(<a href="#vitest_test-name">name</a>, <a href="#vitest_test-node_modules">node_modules</a>, <a href="#vitest_test-config">config</a>, <a href="#vitest_test-data">data</a>, <a href="#vitest_test-snapshots">snapshots</a>, <a href="#vitest_test-auto_configure_reporters">auto_configure_reporters</a>,
            <a href="#vitest_test-auto_configure_test_sequencer">auto_configure_test_sequencer</a>, <a href="#vitest_test-snapshots_ext">snapshots_ext</a>, <a href="#vitest_test-quiet_snapshot_updates">quiet_snapshot_updates</a>, <a href="#vitest_test-timeout">timeout</a>, <a href="#vitest_test-size">size</a>,
            <a href="#vitest_test-kwargs">kwargs</a>)
</pre>

vitest_test rule

Supports Bazel sharding. See https://docs.bazel.build/versions/main/test-encyclopedia.html#test-sharding.


**PARAMETERS**


| Name  | Description | Default Value |
| :------------- | :------------- | :------------- |
| <a id="vitest_test-name"></a>name |  A unique name for this target.   |  none |
| <a id="vitest_test-node_modules"></a>node_modules |  Label pointing to the linked node_modules target where vitest is linked, e.g. <code>//:node_modules</code>. <code>@vitest/coverage-v8</code> is also required by default when <code>auto_configure_reporters</code> is True.<br><br>NB: Only the required npm packages are included in data from <code>//:node_modules</code>. Other npm packages are not included as inputs.   |  none |
| <a id="vitest_test-config"></a>config |  "Optional Vitest config file. See https://vitest.dev/config/file.html.<br><br>Supported config file types are ".js", ".cjs", ".mjs" which come from https://vitest.dev/config/file.html minus TypeScript since we this rule extends from the configuration. TypeScript vitest configs should be transpiled before being passed to vitest_test with [rules_ts](https://github.com/aspect-build/rules_ts).   |  <code>None</code> |
| <a id="vitest_test-data"></a>data |  Runtime dependencies of the Vitest test.<br><br>This should include all test files, configuration files & files under test.   |  <code>[]</code> |
| <a id="vitest_test-snapshots"></a>snapshots |  If True, a <code>{name}_update_snapshots</code> binary target is generated that will update all existing <code>__snapshots__</code> directories when <code>bazel run</code>. This is the equivalent to running <code>vitest -u</code> or <code>vitest --update</code> outside of Bazel, except that new <code>__snapshots__</code> will not automatically be created on update. To bootstrap a new <code>__snapshots__</code> directory, you can create an empty one and then run the <code>{name}_update_snapshots</code> target to populate it.<br><br>If the name of the snapshot directory is not the default <code>__snapshots__</code> because of a custom snapshot resolver, you can specify customize the snapshot directories with a <code>glob</code> or a static list. For example,<br><br><pre><code> vitest_test(     name = "test",     node_modules = "//:node_modules",     config = "vitest.config.mjs",     data = [         "greetings/greetings.jsx",         "greetings/greetings.test.jsx",         "link/link.jsx",         "link/link.test.jsx",     ],     snapshots = glob(["**/__snaps__"], exclude_directories = 0), ) </code></pre><br><br>or with a static list,<br><br><pre><code>     snapshots = [         "greetings/__greetings_snaps__",         "link/__link_snaps__",     ] </code></pre><br><br>Snapshots directories must not contain any files except for snapshots. There must also be no BUILD files in the snapshots directories since they must be part of the same Bazel package that the <code>vitest_test</code> target is in.<br><br>If snapshots are _not_ configured to output to a directory that contains only snapshots, you may alternately set <code>snapshots</code> to a list of snapshot files expected to be generated by this <code>vitest_test</code> target. These must be source files and all snapshots that are generated must be explicitly listed. You may use a <code>glob</code> such as <code>glob(["**/*.snap"])</code> to generate this list, in which case all snapshots must already be on disk so they are discovered by <code>glob</code>.   |  <code>False</code> |
| <a id="vitest_test-auto_configure_reporters"></a>auto_configure_reporters |  Let vitest_test configure reporters for Bazel test and xml test logs.<br><br>The <code>default</code> reporter is used for the standard test log and <code>junit</code> is used for the xml log. These reporters are appended to the list of reporters from the user Vitest <code>config</code> only if they are not already set.   |  <code>True</code> |
| <a id="vitest_test-auto_configure_test_sequencer"></a>auto_configure_test_sequencer |  Let vitest_test configure a custom test sequencer for Bazel test that support Bazel sharding.<br><br>Any custom test.sequence.sequencer value in a user Vitest <code>config</code> will be overridden.<br><br>See https://vitest.dev/config/#sequence-sequencer for more information on Vitest test.sequence.sequencer config option.   |  <code>True</code> |
| <a id="vitest_test-snapshots_ext"></a>snapshots_ext |  The expected extensions for snapshot files. Defaults to <code>.snap</code>, the Vitest default.   |  <code>".snap"</code> |
| <a id="vitest_test-quiet_snapshot_updates"></a>quiet_snapshot_updates |  When True, snapshot update stdout & stderr is hidden when the snapshot update is successful.<br><br>On a snapshot update failure, its stdout & stderr will always be shown.   |  <code>False</code> |
| <a id="vitest_test-timeout"></a>timeout |  standard attribute for tests. Defaults to "short" if both timeout and size are unspecified.   |  <code>None</code> |
| <a id="vitest_test-size"></a>size |  standard attribute for tests   |  <code>None</code> |
| <a id="vitest_test-kwargs"></a>kwargs |  Additional named parameters passed to both <code>js_test</code> and <code>js_binary</code>. See https://github.com/aspect-build/rules_js/blob/main/docs/js_binary.md   |  none |


