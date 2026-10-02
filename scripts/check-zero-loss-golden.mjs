import fs from 'node:fs';
import ts from 'typescript';

const sourceText = fs.readFileSync('src/data/analyticsData.ts','utf8');
const golden = JSON.parse(fs.readFileSync('audit/compatibility-golden-master.json','utf8'));
const sourceFile = ts.createSourceFile('analyticsData.ts', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

function fail(message) {
  console.error('✗', message);
  process.exitCode = 1;
}
function ok(message) { console.log('✓', message); }

function isExportedConst(node, name) {
  if (!ts.isVariableStatement(node)) return false;
  const exported = node.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword);
  if (!exported) return false;
  return node.declarationList.declarations.some(d=>ts.isIdentifier(d.name) && d.name.text===name);
}

function unwrap(node) {
  while (ts.isAsExpression(node) || ts.isParenthesizedExpression(node) || ts.isSatisfiesExpression?.(node)) node=node.expression;
  return node;
}

function evalLiteral(node) {
  node=unwrap(node);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind===ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind===ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind===ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPrefixUnaryExpression(node) && node.operator===ts.SyntaxKind.MinusToken) return -Number(evalLiteral(node.operand));
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(evalLiteral);
  if (ts.isObjectLiteralExpression(node)) {
    const out={};
    for (const p of node.properties) {
      if (!ts.isPropertyAssignment(p)) throw new Error('Unsupported object property: '+p.getText(sourceFile));
      const key = ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) || ts.isNumericLiteral(p.name)
        ? p.name.text : p.name.getText(sourceFile);
      out[key]=evalLiteral(p.initializer);
    }
    return out;
  }
  throw new Error('Unsupported literal expression: '+node.getText(sourceFile));
}

function readConst(name) {
  for (const node of sourceFile.statements) {
    if (!isExportedConst(node,name)) continue;
    const decl=node.declarationList.declarations.find(d=>ts.isIdentifier(d.name) && d.name.text===name);
    let initializer=decl.initializer;
    if (!initializer) throw new Error(name+' has no initializer');
    initializer=unwrap(initializer);
    // kpRegions is [..].map(...); preserve and compare the exact source rows before derived fields.
    if (ts.isCallExpression(initializer) && ts.isPropertyAccessExpression(initializer.expression) && initializer.expression.name.text==='map') {
      initializer=unwrap(initializer.expression.expression);
    }
    return evalLiteral(initializer);
  }
  throw new Error('Missing exported const '+name);
}

function same(label, actual, expected) {
  const a=JSON.stringify(actual);
  const e=JSON.stringify(expected);
  if (a!==e) {
    fail(label+' differs from golden master');
    console.error('  actual  :', a);
    console.error('  expected:', e);
  } else ok(label+' exact');
}

const regions=readConst('REGIONS');
const seasons=readConst('SEASONS');
const ticketTypes=readConst('TICKET_TYPES');
const seasonOverview=readConst('seasonOverview');
const annual=readConst('annual');
const regional=readConst('regional');
const kpRegions=readConst('kpRegions');
const kpPartners=readConst('kpPartners');
const advancedDefaults=readConst('advancedDefaults');
const overnightAreas=readConst('overnightAreas');
const intensityAreas=readConst('intensityAreas');

same('REGIONS',regions,golden.labels.regions);
same('SEASONS',seasons,golden.labels.seasons);
same('TICKET_TYPES',ticketTypes,golden.labels.ticketTypes);
same('seasonOverview',seasonOverview,golden.seasonOverview);
same('annual',annual,golden.annual);
same('regional',regional,golden.regional);
same('kpRegions source rows',kpRegions,golden.kpRegions);
same('kpPartners',kpPartners,golden.kpPartners);
same('advanced observed inputs',{
  weeklyTicketsNetwork:advancedDefaults.weeklyTicketsNetwork,
  weeklyTicketsSouthTyrol:advancedDefaults.weeklyTicketsSouthTyrol,
  dayTickets:advancedDefaults.dayTickets,
}, {
  weeklyTicketsNetwork:golden.advancedDefaults.weeklyTicketsNetwork,
  weeklyTicketsSouthTyrol:golden.advancedDefaults.weeklyTicketsSouthTyrol,
  dayTickets:golden.advancedDefaults.dayTickets,
});
same('advanced model parameters',{
  nightsPerWeeklyGuest:advancedDefaults.nightsPerWeeklyGuest,
  overnightShare:advancedDefaults.overnightShare,
  spendPerNight:advancedDefaults.spendPerNight,
  multiplier:advancedDefaults.multiplier,
  dayOvernightShare:advancedDefaults.dayOvernightShare,
},golden.advancedDefaults.model);
same('advanced ASTAT structure',advancedDefaults.astat,golden.advancedDefaults.astat);
same('overnightAreas',overnightAreas,golden.overnightAreas);
same('intensityAreas',intensityAreas,golden.intensityAreas);

if (process.exitCode) process.exit(process.exitCode);
console.log('\nZero-loss hardcoded-data golden-master check passed.');
