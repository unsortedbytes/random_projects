// Simple wrapper around the `qrencode` command-line tool.
// Usage:
//   qr [options] <text>
// Options:
//   -o <file>    write PNG output to <file> (requires qrencode installed)
//   -l [L|M|Q|H] error correction level (default M)
//   -s <scale>   scale for PNG output (default 4)
// If no -o is provided, the program prints an ASCII QR to stdout.

#include <bits/stdc++.h>
#include <unistd.h>
#include <sys/wait.h>
#include <fcntl.h>
#include <cerrno>
#include <cstring>

using namespace std;

static void usage(const char *prog) {
  cerr << "Usage: " << prog << " [-o out.png] [-l L|M|Q|H] [-s scale] <text>\n";
  cerr << "If -o is omitted an ASCII QR is printed to stdout (requires qrencode).\n";
}

static string find_in_path(const string &name) {
  const char *path = getenv("PATH");
  if (!path) return {};
  string token;
  stringstream ss(path);
  while (getline(ss, token, ':')) {
    string cand = token + "/" + name;
    if (access(cand.c_str(), X_OK) == 0) return cand;
  }
  return {};
}

// Run qrencode executable at 'exe' with args; write 'input' to its stdin.
// If capture_output is true forward child's stdout/stderr to this process' stdout.
// Returns child's exit code, or -1 on internal error.
static int run_qrencode(const string &exe, const vector<string> &args, const string &input, bool capture_output) {
  int inpipe[2];
  if (pipe(inpipe) == -1) { perror("pipe"); return -1; }

  int outpipe[2];
  if (capture_output) {
    if (pipe(outpipe) == -1) { close(inpipe[0]); close(inpipe[1]); perror("pipe"); return -1; }
  }

  pid_t pid = fork();
  if (pid == -1) {
    perror("fork");
    close(inpipe[0]); close(inpipe[1]);
    if (capture_output) { close(outpipe[0]); close(outpipe[1]); }
    return -1;
  }

  if (pid == 0) {
    // Child
    // stdin <- inpipe[0]
    if (dup2(inpipe[0], STDIN_FILENO) == -1) { _exit(127); }
    close(inpipe[0]); close(inpipe[1]);

    if (capture_output) {
      // stdout & stderr -> outpipe[1]
      if (dup2(outpipe[1], STDOUT_FILENO) == -1) _exit(127);
      if (dup2(outpipe[1], STDERR_FILENO) == -1) _exit(127);
      close(outpipe[0]); close(outpipe[1]);
    }

    // build argv for execv
    vector<char*> cargs;
    cargs.reserve(args.size() + 2);
    cargs.push_back(const_cast<char*>(exe.c_str()));
    for (const auto &a : args) cargs.push_back(const_cast<char*>(a.c_str()));
    cargs.push_back(nullptr);
    execv(exe.c_str(), cargs.data());
    // if execv returns it's an error
    _exit(127);
  }

  // Parent
  close(inpipe[0]);
  if (capture_output) close(outpipe[1]);

  // Write input + newline to child's stdin
  string towrite = input;
  if (towrite.empty() || towrite.back() != '\n') towrite.push_back('\n');
  const char *buf = towrite.data();
  size_t left = towrite.size();
  while (left > 0) {
    ssize_t n = write(inpipe[1], buf, left);
    if (n < 0) {
      if (errno == EINTR) continue;
      break;
    }
    buf += n;
    left -= n;
  }
  close(inpipe[1]);

  // If capturing, forward child's output to our stdout
  if (capture_output) {
    char rbuf[4096];
    ssize_t n;
    while ((n = read(outpipe[0], rbuf, sizeof(rbuf))) > 0) {
      ssize_t w = write(STDOUT_FILENO, rbuf, n);
      (void)w;
    }
    close(outpipe[0]);
  }

  int status = 0;
  if (waitpid(pid, &status, 0) == -1) {
    perror("waitpid");
    return -1;
  }
  if (WIFEXITED(status)) return WEXITSTATUS(status);
  if (WIFSIGNALED(status)) return 128 + WTERMSIG(status);
  return -1;
}

int main(int argc, char **argv) {
  if (argc < 2) { usage(argv[0]); return 1; }

  string outpath;
  string level = "M";
  int scale = 4;

  int i = 1;
  while (i < argc && argv[i][0] == '-') {
    string opt = argv[i];
    if (opt == "-o") { if (i+1 >= argc) { usage(argv[0]); return 1; } outpath = argv[++i]; }
    else if (opt == "-l") { if (i+1 >= argc) { usage(argv[0]); return 1; } level = argv[++i]; }
    else if (opt == "-s") { if (i+1 >= argc) { usage(argv[0]); return 1; } scale = atoi(argv[++i]); }
    else { usage(argv[0]); return 1; }
    ++i;
  }

  if (i >= argc) { usage(argv[0]); return 1; }

  string text;
  for (; i < argc; ++i) {
    if (!text.empty()) text += " ";
    text += argv[i];
  }

  string qrencode = find_in_path("qrencode");
  if (qrencode.empty()) {
    cerr << "Required external tool 'qrencode' not found. Install it (e.g. sudo apt install qrencode).\n";
    return 2;
  }

  vector<string> args;
  args.push_back("-l"); args.push_back(level);

  if (outpath.empty()) {
    // ASCII to stdout
    args.push_back("-t"); args.push_back("ANSIUTF8");
    int rc = run_qrencode(qrencode, args, text, true);
    if (rc != 0) { cerr << "qrencode failed with code " << rc << "\n"; return 1; }
    return 0;
  } else {
    args.push_back("-o"); args.push_back(outpath);
    args.push_back("-s"); args.push_back(to_string(scale));
    int rc = run_qrencode(qrencode, args, text, false);
    if (rc != 0) { cerr << "qrencode failed with code " << rc << "\n"; return 1; }
    cout << "Wrote " << outpath << "\n";
    return 0;
  }
}

