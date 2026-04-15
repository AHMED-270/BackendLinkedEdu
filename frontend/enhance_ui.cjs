const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, 'src/components'),
  path.join(__dirname, 'src/pages'),
];

const injections = [
  {
    regex: /className="([^"]*sidebar[^"]*|aside[^"]*|h-full w-full[^"]*)"/g,
    inject: ' bg-white/70 backdrop-blur-xl border-r border-[#E5E7EB]/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300'
  },
  {
    regex: /className="([^"]*header\b[^"]*)"/g,
    inject: ' !bg-white/70 backdrop-blur-2xl border-b border-white/50 !shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-300'
  },
  {
    regex: /className="([^"]*header-profile\b[^"]*|icon-btn\b[^"]*)"/g,
    inject: ' !bg-white/60 hover:!bg-white/90 backdrop-blur-md border border-white/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-300'
  },
  {
    regex: /className="([^"]*modal-backdrop\b[^"]*)"/g,
    inject: ' !bg-[#0f172a]/40 backdrop-blur-lg transition-all duration-300'
  },
  {
    regex: /className="([^"]*modal-card\b[^"]*)"/g,
    inject: ' bg-white/80 backdrop-blur-2xl border border-white !shadow-[0_24px_60px_rgba(0,0,0,0.1)] transition-all duration-300'
  },
  {
    regex: /className="([^"]*min-h-screen[^"]*bg-[^"]*)"/g,
    inject: ' !bg-[linear-gradient(to_bottom_right,#f0f9ff,#fdfbfb,#ebf4f5)] relative overflow-hidden backdrop-saturate-150'
  },
  {
    regex: /className="([^"]*rounded-xl[^"]*bg-white[^"]*|bg-white rounded-[^"]*)"/g,
    inject: ' !bg-white/70 backdrop-blur-xl border border-white/80 !shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(41,107,116,0.06)] transition-all duration-300'
  },
  {
    regex: /className="([^"]*form-input\b[^"]*|input\b[^"]*|rounded[^"]*border[^"]*)"/g,
    inject: ' !bg-white/50 focus:!bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600 border-white/60 transition-all duration-300 !shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]'
  },
  {
    regex: /className="([^"]*bg-blue-600[^"]*|btn-primary\b[^"]*)"/g,
    inject: ' !bg-[linear-gradient(135deg,#1E3A8A,#2563EB)] !border-0 !text-white hover:!shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300'
  }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  if (filePath.includes('Sidebar.jsx') && !content.includes('linkedu-logo.png')) {
    if(!content.includes("import logo from '../assets/images/linkedu-logo.png';")) {
       content = content.replace(/(import.*';\n)(?!import)/, "$1import logo from '../assets/images/linkedu-logo.png';\n");
    }
    content = content.replace(
      /<div className="flex h-full flex-col px-3 py-4">/,
      `<div className="flex h-full flex-col px-3 py-4">\n          <div className="flex items-center justify-center mb-6">\n            <img src={logo} alt="LinkEdu" className="h-10 w-auto drop-shadow-md hover:scale-105 transition-transform duration-300" />\n          </div>`
    );
  }

  if (filePath.includes('Sidebar.jsx') || filePath.includes('DirectorSidebar.jsx') || filePath.includes('SecretaireSidebar.jsx')) {
    content = content.replace(
      /isActive \? '([^']+)' : '([^']+)'/g,
      `isActive ? '$1 bg-blue-500/10 text-blue-700 shadow-[inset_4px_0_0_#2563eb] font-semibold backdrop-blur-md' : '$2 hover:bg-slate-50/50 hover:text-blue-600 transition-all duration-300'`
    );
  }

  injections.forEach(rule => {
    content = content.replace(rule.regex, (match, classes) => {
      // Check to prevent multiple identical re-injections during testing
      if (classes.includes('backdrop-blur') || classes.includes('transition-all')) {
        return match;
      }
      return `className="${classes}${rule.inject}"`;
    });
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✨ Enhanced UI for: ${path.basename(filePath)}`);
  }
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

targetDirs.forEach(dir => processDirectory(dir));
console.log('✅ UI Enhancement Complete.');