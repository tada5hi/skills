import process from 'node:process'
import { cmdCheck, cmdCleanup, cmdInit, cmdLink, cmdSync } from './commands/index.ts'

function printUsage(): void {
    console.log('Skills Manager\n')
    console.log('Usage: npx tsx src/cli.ts <command>\n')
    console.log('Commands:')
    console.log('  init      Add vendor submodules defined in meta.ts')
    console.log('  sync      Pull latest vendor changes and sync into skills/')
    console.log('  check     Show available upstream updates')
    console.log('  cleanup   Remove submodules and skills not in meta.ts')
    console.log('  link      Create .claude/skills/ links for Claude Code discovery')
    console.log('')
}

const command = process.argv[2]

switch (command) {
    case 'init':
        cmdInit()
        break
    case 'sync':
        cmdSync()
        break
    case 'check':
        cmdCheck()
        break
    case 'cleanup':
        cmdCleanup()
        break
    case 'link':
        cmdLink()
        break
    default:
        printUsage()
        process.exit(command ? 1 : 0)
}
