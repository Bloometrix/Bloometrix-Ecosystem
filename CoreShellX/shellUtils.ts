import { exec } from "child_process"

/**
 * Execute a shell command and return stdout or throw on error.
 * @param command Shell command to run (e.g., "ls -la")
 * @param timeoutMs Timeout in milliseconds (default 30s)
 */
export function execCommand(command: string, timeoutMs: number = 30_000): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, { timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        const msg = [
          `Command failed: ${command}`,
          stderr.trim() || stdout.trim() || error.message,
        ]
          .filter(Boolean)
          .join("\n")
        return reject(new Error(msg))
      }
      resolve(stdout.trim())
    })
  })
}
