import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { defineConfig, Plugin } from 'vite';

function localExecutableLauncherPlugin(): Plugin {
  return {
    name: 'local-executable-launcher',
    configureServer(server) {
      // 1. Endpoint to launch local executable
      server.middlewares.use('/api/launch-app', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { path: appPath, args = [] } = JSON.parse(body || '{}');
              if (!appPath) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Caminho do executável é obrigatório' }));
                return;
              }

              // On Windows, use cmd.exe /c start "" "appPath" args... to launch detached
              const formattedArgs = args.length > 0 ? ` ${args.join(' ')}` : '';
              const command = `start "" "${appPath}"${formattedArgs}`;

              const proc = spawn('cmd.exe', ['/c', command], {
                detached: true,
                stdio: 'ignore',
                windowsHide: true,
              });
              proc.unref();

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: `Iniciado: ${appPath}` }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err?.message || String(err) }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end();
        }
      });

      // 2. Endpoint to check which common executables are present on this machine
      server.middlewares.use('/api/detect-apps', (req, res) => {
        if (req.method === 'GET') {
          const commonApps = [
            {
              id: 'teamviewer',
              title: 'TeamViewer',
              paths: [
                'C:\\Program Files\\TeamViewer\\TeamViewer.exe',
                'C:\\Program Files (x86)\\TeamViewer\\TeamViewer.exe',
              ],
              protocolUri: 'teamviewer:',
              iconName: 'Monitor',
              category: 'infra',
              subtitle: 'Acesso Remoto Rápido para Cartórios',
            },
            {
              id: 'anydesk',
              title: 'AnyDesk',
              paths: [
                'C:\\Program Files (x86)\\AnyDesk\\AnyDesk.exe',
                'C:\\Program Files\\AnyDesk\\AnyDesk.exe',
              ],
              protocolUri: 'anydesk:',
              iconName: 'Monitor',
              category: 'infra',
              subtitle: 'Conexão Remota Alternativa',
            },
            {
              id: 'mstsc',
              title: 'Área de Trabalho Remota (RDP)',
              paths: [
                'C:\\Windows\\System32\\mstsc.exe',
              ],
              iconName: 'Server',
              category: 'infra',
              subtitle: 'Conexão Nativa Windows RDP',
            },
            {
              id: 'calc',
              title: 'Calculadora',
              paths: [
                'C:\\Windows\\System32\\calc.exe',
              ],
              protocolUri: 'calculator:',
              iconName: 'Receipt',
              category: 'utilitarios',
              subtitle: 'Cálculo de Emolumentos e Custas',
            },
            {
              id: 'notepad',
              title: 'Bloco de Notas',
              paths: [
                'C:\\Windows\\System32\\notepad.exe',
              ],
              iconName: 'FileText',
              category: 'utilitarios',
              subtitle: 'Anotações Rápidas e Edição TXT',
            },
            {
              id: 'powershell',
              title: 'PowerShell Técnico',
              paths: [
                'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
              ],
              iconName: 'Terminal',
              category: 'infra',
              subtitle: 'Automação e Diagnósticos de Rede',
            },
          ];

          const results = commonApps.map(app => {
            const detectedPath = app.paths.find(p => fs.existsSync(p));
            return {
              ...app,
              isInstalled: !!detectedPath,
              resolvedPath: detectedPath || app.paths[0],
            };
          });

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ apps: results }));
        } else {
          res.statusCode = 405;
          res.end();
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), localExecutableLauncherPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/glpi': {
          target: process.env.VITE_GLPI_URL || 'https://sistema.esdi.com.br',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/glpi/, ''),
          secure: false,
        },
        '/api/esdi': {
          target: 'https://sistema.esdi.com.br/api.php/v2.2',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/esdi/, ''),
          secure: false,
        },
      },
    },
  };
});
