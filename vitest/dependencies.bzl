"Runtime starlark dependencies"

load("//vitest/private:maybe.bzl", http_archive = "maybe_http_archive")

def rules_vitest_dependencies():
    "Runtime dependencies for rules_vitest"

    http_archive(
        name = "bazel_skylib",
        sha256 = "b8a1527901774180afc798aeb28c4634bdccf19c4d98e7bdd1ce79d1fe9aaad7",
        urls = ["https://github.com/bazelbuild/bazel-skylib/releases/download/1.4.1/bazel-skylib-1.4.1.tar.gz"],
    )

    http_archive(
        name = "aspect_bazel_lib",
        sha256 = "d0529773764ac61184eb3ad3c687fb835df5bee01afedf07f0cf1a45515c96bc",
        strip_prefix = "bazel-lib-1.42.3",
        url = "https://github.com/aspect-build/bazel-lib/releases/download/v1.42.3/bazel-lib-v1.42.3.tar.gz",
    )

    http_archive(
        name = "bazel_features",
        sha256 = "06f02b97b6badb3227df2141a4b4622272cdcd2951526f40a888ab5f43897f14",
        strip_prefix = "bazel_features-1.9.0",
        url = "https://github.com/bazel-contrib/bazel_features/releases/download/v1.9.0/bazel_features-v1.9.0.tar.gz",
    )

    http_archive(
        name = "aspect_rules_js",
        sha256 = "2cfb3875e1231cefd3fada6774f2c0c5a99db0070e0e48ea398acbff7c6c765b",
        strip_prefix = "rules_js-1.42.3",
        url = "https://github.com/aspect-build/rules_js/releases/download/v1.42.3/rules_js-v1.42.3.tar.gz",
    )

    http_archive(
        name = "rules_nodejs",
        sha256 = "0c2277164b1752bb71ecfba3107f01c6a8fb02e4835a790914c71dfadcf646ba",
        urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.8.5/rules_nodejs-core-5.8.5.tar.gz"],
    )
