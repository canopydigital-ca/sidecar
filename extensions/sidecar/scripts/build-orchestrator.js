#!/usr/bin/env bun

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

class BuildOrchestrator {
  constructor() {
    this.processes = []
    this.isDev = process.argv.includes('--dev')
    this.isProduction = process.argv.includes('--production')
    this.logPrefix = '[Build Orchestrator]'
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'
    console.log(`${this.logPrefix} ${prefix} [${timestamp}] ${message}`)
  }

  runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'pipe',
        shell: true,
        ...options
      })

      let stdout = ''
      let stderr = ''

      child.stdout.on('data', (data) => {
        stdout += data.toString()
        if (options.log) {
          this.log(data.toString().trim(), 'info')
        }
      })

      child.stderr.on('data', (data) => {
        stderr += data.toString()
        if (options.log) {
          this.log(data.toString().trim(), 'error')
        }
      })

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr })
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`))
        }
      })

      child.on('error', reject)

      this.processes.push(child)
    })
  }

  async buildUI() {
    this.log('Starting UI build process...', 'info')

    try {
      const mode = this.isDev ? 'development' : 'production'
      const buildCommand = this.isDev
        ? `vite build --watch --mode ${mode}`
        : `vite build --mode ${mode}`

      // Set NODE_ENV for Vite config to pick up
      const env = { ...process.env, NODE_ENV: mode }

      await this.runCommand('bun', ['run', buildCommand], {
        cwd: join(__dirname, '..'),
        log: true,
        env
      })

      this.log('UI build completed successfully', 'success')
      return true
    } catch (error) {
      this.log(`UI build failed: ${error.message}`, 'error')
      throw error
    }
  }

  async buildMain() {
    this.log('Starting main application build...', 'info')

    try {
      const script = this.isDev ? 'dev:main' : 'build:main'
      
      await this.runCommand('bun', ['run', script], {
        cwd: join(__dirname, '..'),
        log: true
      })
      
      // Build background script
      if (!this.isDev) {
         this.log('Building background script...', 'info')
         await this.runCommand('bun', ['run', 'build:background'], {
           cwd: join(__dirname, '..'),
           log: true
         })
      } else {
         // For dev, we might want to watch or just build once. 
         // Since bun build doesn't have a simple watch mode that exits, 
         // we'll just build it once for now or assume dev:main handles watching if we integrated it.
         // But here we added a separate script.
         // Let's just build it once for dev too.
         this.log('Building background script (dev)...', 'info')
         await this.runCommand('bun', ['run', 'build:background'], {
           cwd: join(__dirname, '..'),
           log: true
         })
      }


      this.log('Main application build completed', 'success')
      return true
    } catch (error) {
      this.log(`Main build failed: ${error.message}`, 'error')
      throw error
    }
  }

  async verifyBuild() {
    this.log('Verifying build integrity...', 'info')

    try {
      await this.runCommand('bun', ['run', 'verify:bundle'], {
        cwd: join(__dirname, '..'),
        log: true
      })

      this.log('Build verification passed', 'success')
      return true
    } catch (error) {
      this.log(`Build verification failed: ${error.message}`, 'error')
      throw error
    }
  }

  async run() {
    try {
      // Ensure dist directory exists
      const distDir = join(__dirname, '..', 'dist')
      if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true })
      }

      // Build UI components first (dependency)
      await this.buildUI()

      // Copy pets assets (dependency)
      this.log('Copying pets assets...', 'info')
      await this.runCommand('bun', ['run', 'copy:assets'], {
        cwd: join(__dirname, '..'),
        log: true
      })

      // Build main application
      await this.buildMain()

      // Verify the build in production
      if (this.isProduction) {
        await this.verifyBuild()
      }

      this.log('Build orchestration completed successfully!', 'success')

      if (this.isDev) {
        this.log('Development mode: watching for changes...', 'info')
        // Keep process alive for watch mode
        process.stdin.resume()
      } else {
        process.exit(0)
      }

    } catch (error) {
      this.log(`Build orchestration failed: ${error.message}`, 'error')

      // Clean up any running processes
      this.processes.forEach(proc => {
        try {
          proc.kill()
        } catch (e) {
          // Ignore cleanup errors
        }
      })

      process.exit(1)
    }
  }

  cleanup() {
    this.processes.forEach(proc => {
      try {
        proc.kill()
      } catch (e) {
        // Ignore cleanup errors
      }
    })
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, shutting down...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, shutting down...')
  process.exit(0)
})

// Run the orchestrator
const orchestrator = new BuildOrchestrator()
orchestrator.run()
