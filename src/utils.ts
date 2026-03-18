import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const root = join(__dirname, '..')
export const isWindows = process.platform === 'win32'

export function exec(cmd: string, cwd = root): string {
    return execSync(cmd, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
}

export function execSafe(cmd: string, cwd = root): string | null {
    try {
        return exec(cmd, cwd)
    }
    catch {
        return null
    }
}

export function getGitSha(dir: string): string | null {
    return execSafe('git rev-parse HEAD', dir)
}

export function log(msg: string): void {
    console.log(msg)
}

export function warn(msg: string): void {
    console.warn(`  WARN  ${msg}`)
}

export function info(msg: string): void {
    console.log(`  INFO  ${msg}`)
}

export function success(msg: string): void {
    console.log(`  DONE  ${msg}`)
}
