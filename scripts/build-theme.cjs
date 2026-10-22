const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const postcss = require('postcss');

const rootPath = path.resolve(__dirname, '..');
const sourcePath = path.join(rootPath, 'src', 'theme.css');
const outputPath = path.join(rootPath, 'theme.css');
const source = fs.readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
const ast = postcss.parse(source, {from: sourcePath});
const compact = ast.clone();

// Keep functional metadata, lint directives, and license notices intact.
compact.walkComments(comment => {
  if (!/^\s*(?:@settings\b|eslint-|stylelint-|!|@license\b|@preserve\b)/.test(comment.text)) {
    comment.remove();
  }
});

// Remove formatting whitespace without rewriting selectors or values.
compact.walk(node => {
  node.raws.before = '';
  if (node.type === 'decl') node.raws.between = ':';
  else if (node.type === 'rule' || node.type === 'atrule') node.raws.between = '';
  if (node.nodes) node.raws.after = '';
});
compact.raws.after = '';
const banner = postcss.comment({text: 'Generated from src/theme.css. Edit the source and run npm run build.'});
if (compact.first?.type === 'atrule' && compact.first.name === 'charset') {
  compact.insertAfter(compact.first, banner);
} else {
  compact.prepend(banner);
}
banner.raws.before = '';
const output = compact.toString() + '\n';

function structure(root) {
  const entries = [];
  root.walk(node => {
    if (node.type !== 'comment') {
      entries.push({
        type: node.type,
        name: node.name,
        params: node.params,
        selector: node.selector,
        prop: node.prop,
        value: node.value,
        important: node.important,
        children: node.nodes?.filter(child => child.type !== 'comment').length
      });
    }
  });
  return entries;
}

function settings(root) {
  const entries = [];
  root.walkComments(comment => {
    if (/^\s*@settings\b/.test(comment.text)) entries.push(comment.text);
  });
  return entries;
}

// Reject output that changes CSS rules or the Style Settings configuration.
const generated = postcss.parse(output, {from: outputPath});
assert.deepEqual(structure(generated), structure(ast), 'Generated CSS differs from the source rules.');
assert.deepEqual(settings(generated), settings(ast), 'Style Settings metadata differs from the source.');
assert.ok(Buffer.byteLength(output) < 100_000, 'Generated theme.css exceeds the 100 KB size budget.');

if (process.argv.includes('--check')) {
  const current = fs.readFileSync(outputPath, 'utf8').replace(/\r\n/g, '\n');
  assert.equal(current, output, 'theme.css is out of date. Run npm run build.');
  console.log('theme.css matches src/theme.css.');
} else {
  fs.writeFileSync(outputPath, output);
  console.log(`Built theme.css: ${Buffer.byteLength(output).toLocaleString('en-US')} bytes.`);
}
