import assert from 'node:assert/strict';
import { STUDIO_TEMPLATES } from '../src/data/studioTemplates';
import { templateToCanvasDoc, createImageObject } from '../src/utils/canvasBuilder';
import { getDocumentColors, replaceDocumentColor } from '../src/utils/documentColors';

for (const template of STUDIO_TEMPLATES) {
  const doc = templateToCanvasDoc(template);
  assert.notEqual(doc.id, template.canvasDoc!.id);
  for (const object of doc.objects) {
    assert.ok(!object.locked && object.visible);
    assert.ok(object.x >= 0 && object.y >= 0);
    assert.ok(object.x + object.width <= doc.canvasWidth);
    assert.ok(object.y + object.height <= doc.canvasHeight);
  }
  const before = JSON.stringify(doc);
  const recolored = replaceDocumentColor(doc, doc.background, '#123456');
  assert.equal(recolored.background, '#123456');
  assert.equal(JSON.stringify(doc), before, 'Palette edits must not mutate undo history');
  assert.ok(!getDocumentColors(recolored).includes(doc.background));
  assert.equal(replaceDocumentColor(doc, doc.background, 'invalid'), doc);
}
const doc = templateToCanvasDoc(STUDIO_TEMPLATES[0]);
doc.background = '#ABC';
doc.objects.push(createImageObject('data:image/png;base64,test'));
const changed = replaceDocumentColor(doc, '#aabbcc', '#112233');
assert.equal(changed.background, '#112233');
assert.equal(changed.objects.at(-1), doc.objects.at(-1), 'Photos must remain untouched');
assert.equal(new Set(getDocumentColors(doc)).size, getDocumentColors(doc).length);
console.log('Studio templates and document color replacement passed.');
