# qr (QR code wrapper)

This is a small C++ CLI wrapper that uses the system `qrencode` tool to convert text into QR codes.

Features

-   Print an ASCII QR code to the terminal.
-   Write PNG output using `qrencode`.

Build

Requires a C++17 compiler (g++/clang++) and the `qrencode` command-line tool installed to produce actual QR codes.

Compile:

```bash
g++ -std=c++17 -O2 qr.cpp -o qr
```

Usage

Print ASCII QR to stdout:

```bash
./qr "Hello, world!"
```

Write a PNG file:

```bash
./qr -o hello.png -l H -s 8 "Hello, world!"
```

If `qrencode` is not installed, install it on Debian/Ubuntu:

```bash
sudo apt update && sudo apt install qrencode
```

Notes

-   This program is a lightweight wrapper that delegates QR generation to `qrencode`.
-   If you want a pure C++ implementation without external dependencies, I can add an embedded library (single-file) — tell me if you'd prefer that.
