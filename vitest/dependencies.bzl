"Runtime starlark dependencies"

load("//vitest/private:maybe.bzl", http_archive = "maybe_http_archive")

def rules_vitest_dependencies():
    http_archive(
        name = "bazel_skylib",
        sha256 = "51b5105a760b353773f904d2bbc5e664d0987fbaf22265164de65d43e910d8ac",
        urls = [
            "https://mirror.bazel.build/github.com/bazelbuild/bazel-skylib/releases/download/1.8.1/bazel-skylib-1.8.1.tar.gz",
            "https://github.com/bazelbuild/bazel-skylib/releases/download/1.8.1/bazel-skylib-1.8.1.tar.gz",
        ],
    )

    http_archive(
        name = "aspect_bazel_lib",
        sha256 = "94e192033ca8027f26de71c9000a67ef9c73695c2b88e2c559045170917ead0c",
        strip_prefix = "bazel-lib-2.22.5",
        url = "https://github.com/bazel-contrib/bazel-lib/releases/download/v2.22.5/bazel-lib-v2.22.5.tar.gz",
    )

    http_archive(
        name = "aspect_rules_js",
        sha256 = "1774702556e1d0b83b7f5eb58ec95676afe6481c62596b53f5b96575bacccf73",
        strip_prefix = "rules_js-2.9.2",
        url = "https://github.com/aspect-build/rules_js/releases/download/v2.9.2/rules_js-v2.9.2.tar.gz",
    )

    http_archive(
        name = "rules_nodejs",
        sha256 = "732aa2aeef9ba629cd7fa1cb30da07e6b696ed78706b08d84d5d8601982f38b1",
        strip_prefix = "rules_nodejs-6.3.3",
        url = "https://github.com/bazel-contrib/rules_nodejs/releases/download/v6.3.3/rules_nodejs-v6.3.3.tar.gz",
    )
