import type { CardTemplate, CanvasObject } from '../types/card';
import { createTextObject as text, createShapeObject as shape } from '../utils/canvasBuilder';

const paper = '#eee8dc';
const ink = '#292723';
const rust = '#a83f2b';
const mono = "'JetBrains Mono', monospace";
const serif = "'Instrument Serif', Georgia, serif";
const sans = "'Space Grotesk', sans-serif";

const template = (id: string, title: string, category: CardTemplate['category'], background: string, color: string, width: number, height: number, objects: CanvasObject[]): CardTemplate => ({
  id, title, category, categoryLabel: category === 'poster' ? 'Print & poster' : 'Studio collection',
  quote: title, author: 'Independent studio', tag: 'STUDIO EDITIONS', badge: '01',
  theme: { id, name: title, bg: background, ink: color, category: 'editorial' },
  font: 'instrument', fontSize: 32, align: 'left', padding: 32, borderRadius: 0,
  showGrain: false, showBorder: false, showIcon: false, iconName: '',
  tags: ['studio', 'typography', 'editable', category],
  description: 'Individually editable typography, shapes, and colors.',
  canvasDoc: { id: `doc_${id}`, title, canvasWidth: width, canvasHeight: height, background, objects, createdAt: '2026-11-20T00:00:00.000Z', updatedAt: '2026-11-20T00:00:00.000Z' },
});

export const STUDIO_TEMPLATES: CardTemplate[] = [
  template('studio-form-study', 'Form Study', 'poster', paper, ink, 800, 1000, [
    text({ name: 'Exhibition label', text: 'STUDIO EXHIBITIONS / 2026', fontFamily: mono, fontSize: 16, color: ink, x: 48, y: 36, width: 600, height: 28 }),
    shape('line', { x: 48, y: 84, width: 704, height: 2, fill: ink }),
    text({ name: 'Poster title', text: 'Form\n& feeling.', fontFamily: sans, fontSize: 100, lineHeight: 1, letterSpacing: -5, fontWeight: '700', color: ink, x: 42, y: 112, width: 710, height: 235 }),
    shape('circle', { name: 'Vermilion disc', x: 164, y: 405, width: 430, height: 430, fill: rust, zIndex: 2 }),
    shape('rect', { name: 'Paper cutout', x: 380, y: 405, width: 214, height: 430, fill: paper, zIndex: 3 }),
    shape('rect', { name: 'Graphite column', x: 420, y: 405, width: 174, height: 430, fill: ink, zIndex: 4 }),
    text({ name: 'Work caption', text: 'FIG. 01 / CUT PAPER STUDY', fontFamily: mono, fontSize: 13, color: ink, x: 48, y: 850, width: 500, height: 24 }),
    shape('line', { x: 48, y: 886, width: 704, height: 2, fill: ink }),
    text({ name: 'Exhibition date', text: '12—28 NOVEMBER\nOPEN DAILY 10:00—18:00', fontFamily: mono, fontSize: 15, color: ink, x: 48, y: 910, width: 350, height: 50 }),
    text({ name: 'Venue', text: 'THE SMALL GALLERY\nBhopal, India', fontFamily: mono, fontSize: 15, color: ink, x: 450, y: 910, width: 302, height: 50 }),
  ]),
  template('studio-after-hours', 'After Hours', 'poster', '#242724', '#eee8dc', 800, 1000, [
    text({ name: 'Series label', text: 'AN INDEPENDENT FILM SERIES', fontFamily: mono, fontSize: 16, color: paper, x: 48, y: 40, width: 700, height: 30 }),
    text({ name: 'Screening title', text: 'After\nhours', fontFamily: serif, fontSize: 150, lineHeight: 0.9, fontWeight: '400', color: paper, x: 42, y: 128, width: 710, height: 300 }),
    shape('rect', { name: 'Screen frame', x: 48, y: 492, width: 704, height: 270, fill: '#bdad89', zIndex: 1 }),
    shape('circle', { name: 'Moon', x: 480, y: 520, width: 110, height: 110, fill: paper, zIndex: 2 }),
    shape('rect', { name: 'Foreground left', x: 48, y: 645, width: 330, height: 117, fill: '#464b40', zIndex: 3 }),
    shape('rect', { name: 'Foreground right', x: 378, y: 688, width: 374, height: 74, fill: '#242724', zIndex: 3 }),
    ...Array.from({ length: 12 }, (_, i) => shape('rect', { name: `Film perforation ${i + 1}`, x: 60 + i * 58, y: 502, width: 16, height: 9, fill: '#242724', zIndex: 4 })),
    text({ name: 'Screen number', text: 'SCREEN 02', fontFamily: mono, fontSize: 16, color: paper, x: 590, y: 928, width: 162, height: 30 }),
    text({ name: 'Screening notes', text: 'A programme of short films\nfor the last screening of the day.', fontFamily: serif, fontSize: 30, color: paper, x: 48, y: 795, width: 700, height: 90 }),
    shape('line', { x: 48, y: 908, width: 704, height: 1, fill: paper }),
    text({ name: 'Screening details', text: 'FRIDAY / 20:30', fontFamily: mono, fontSize: 16, color: paper, x: 48, y: 928, width: 400, height: 30 }),
  ]),
  template('studio-side-a', 'Side A', 'minimal', '#d5c4a8', ink, 800, 800, [
    text({ name: 'Session label', text: 'LISTENING ROOM\nSESSIONS / VOL. 04', fontFamily: mono, fontSize: 17, color: ink, x: 40, y: 36, width: 400, height: 55 }),
    text({ name: 'Edition', text: '33⅓ RPM', fontFamily: mono, fontSize: 17, color: ink, x: 590, y: 36, width: 170, height: 30 }),
    shape('circle', { name: 'Record', x: 180, y: 154, width: 440, height: 440, fill: ink, zIndex: 1 }),
    ...[404, 376, 348, 320, 292, 264, 236].map(size => shape('circle', { name: `Record groove ${size}`, x: 400 - size / 2, y: 374 - size / 2, width: size, height: size, fill: 'transparent', stroke: '#575148', strokeWidth: 1.5, zIndex: 2 })),
    shape('circle', { name: 'Record label', x: 310, y: 284, width: 180, height: 180, fill: rust, zIndex: 3 }),
    shape('circle', { name: 'Spindle', x: 391, y: 365, width: 18, height: 18, fill: '#d5c4a8', zIndex: 4 }),
    text({ name: 'Record side', text: 'A', fontFamily: sans, fontSize: 30, fontWeight: '700', color: paper, x: 350, y: 305, width: 100, height: 38 }),
    text({ name: 'Record catalogue', text: 'LR—004 / STEREO', fontFamily: mono, fontSize: 11, color: paper, x: 342, y: 408, width: 140, height: 20 }),
    shape('line', { name: 'Sleeve rule', x: 40, y: 616, width: 720, height: 1.5, fill: ink }),
    text({ name: 'Album title', text: 'Side A', fontFamily: serif, fontSize: 98, fontWeight: '400', lineHeight: 1.05, color: ink, x: 40, y: 620, width: 440, height: 120 }),
    text({ name: 'Track notes', text: 'SLOW SUNDAY\nA PERSONAL SELECTION\n45 MINUTES', fontFamily: mono, fontSize: 16, color: ink, x: 520, y: 660, width: 240, height: 80 }),
  ]),
  template('studio-visitor', 'Studio Visitor', 'id-card', paper, ink, 960, 600, [
    shape('rect', { name: 'Pass stripe', x: 0, y: 0, width: 22, height: 600, fill: rust }),
    text({ name: 'Studio name', text: 'COMMON\nGROUND', fontFamily: sans, fontSize: 38, fontWeight: '700', lineHeight: 1, color: ink, x: 62, y: 42, width: 400, height: 90 }),
    text({ name: 'Pass number', text: 'VISITOR / 0084', fontFamily: mono, fontSize: 17, color: ink, x: 650, y: 42, width: 248, height: 28 }),
    text({ name: 'Access code', text: '01', fontFamily: sans, fontSize: 68, fontWeight: '700', lineHeight: 1.05, color: rust, x: 804, y: 74, width: 94, height: 80 }),
    shape('line', { x: 62, y: 165, width: 836, height: 2, fill: ink }),
    text({ name: 'Name label', text: 'HELLO, MY NAME IS', fontFamily: mono, fontSize: 16, color: rust, x: 62, y: 202, width: 700, height: 30 }),
    text({ name: 'Visitor name', text: 'Alex Morgan', fontFamily: serif, fontSize: 92, fontWeight: '400', lineHeight: 1.1, color: ink, x: 56, y: 248, width: 842, height: 115 }),
    text({ name: 'Role', text: 'Designer & image maker', fontFamily: sans, fontSize: 25, color: ink, x: 62, y: 380, width: 800, height: 45 }),
    shape('line', { x: 62, y: 476, width: 836, height: 2, fill: ink }),
    text({ name: 'Access details', text: 'OPEN STUDIO / ALL DAY\n20 NOVEMBER 2026', fontFamily: mono, fontSize: 16, color: ink, x: 62, y: 506, width: 500, height: 55 }),
    text({ name: 'Pass footer', text: 'DESIGN DEPARTMENT\nGROUND FLOOR', fontFamily: mono, fontSize: 16, color: rust, x: 650, y: 506, width: 248, height: 55 }),
  ]),
  template('studio-night-ticket', 'Night Shift', 'vintage', '#e5b65f', '#322720', 960, 600, [
    text({ name: 'Promoter', text: 'INDEPENDENT RADIO / LIVE SESSIONS', fontFamily: mono, fontSize: 16, color: '#322720', x: 48, y: 38, width: 650, height: 28 }),
    shape('line', { name: 'Header rule', x: 48, y: 90, width: 650, height: 2, fill: '#322720' }),
    text({ name: 'Event title', text: 'NIGHT\nSHIFT', fontFamily: sans, fontSize: 112, fontWeight: '700', lineHeight: 0.96, letterSpacing: -6, color: '#322720', x: 40, y: 125, width: 650, height: 234 }),
    text({ name: 'Event subtitle', text: 'Jazz, records & conversations', fontFamily: serif, fontSize: 34, color: '#322720', x: 48, y: 380, width: 650, height: 50 }),
    shape('line', { name: 'Footer rule', x: 48, y: 465, width: 650, height: 2, fill: '#322720' }),
    text({ name: 'Date', text: 'SATURDAY\n28 NOVEMBER', fontFamily: mono, fontSize: 17, color: '#322720', x: 48, y: 494, width: 270, height: 62 }),
    text({ name: 'Venue', text: 'DOORS 21:00\nTHE BASEMENT', fontFamily: mono, fontSize: 17, color: '#322720', x: 400, y: 494, width: 298, height: 62 }),
    ...Array.from({ length: 22 }, (_, i) => shape('line', { name: `Stub perforation ${i + 1}`, x: 742, y: 15 + i * 26, width: 2, height: 12, fill: '#322720' })),
    text({ name: 'Stub label', text: 'ADMIT ONE', fontFamily: mono, fontSize: 16, color: '#322720', x: 782, y: 40, width: 160, height: 30 }),
    text({ name: 'Ticket number', text: '084', fontFamily: sans, fontSize: 57, fontWeight: '700', color: '#322720', x: 782, y: 235, width: 158, height: 80 }),
    text({ name: 'Stub details', text: 'GENERAL\nADMISSION\n\nKEEP THIS\nCOUNTERFOIL', fontFamily: mono, fontSize: 15, lineHeight: 1.4, color: '#322720', x: 782, y: 375, width: 160, height: 150 }),
  ]),
  template('studio-reading-room', 'Reading Room', 'quote', '#e9e5da', '#403c37', 800, 1000, [
    shape('rect', { name: 'Book spine', x: 0, y: 0, width: 30, height: 1000, fill: '#753e40' }),
    text({ name: 'Issue', text: 'THE READING ROOM                 ISSUE 06', fontFamily: mono, fontSize: 15, color: '#403c37', x: 72, y: 40, width: 668, height: 30 }),
    shape('line', { name: 'Masthead rule', x: 72, y: 88, width: 668, height: 1.5, fill: '#403c37' }),
    text({ name: 'Cover title', text: 'On taking\nyour time.', fontFamily: serif, fontSize: 108, lineHeight: 1, fontWeight: '400', color: '#753e40', x: 66, y: 142, width: 674, height: 250 }),
    text({ name: 'Deck', text: 'Notes on reading, attention\nand the things we keep.', fontFamily: serif, fontSize: 35, lineHeight: 1.2, color: '#403c37', x: 72, y: 420, width: 630, height: 100 }),
    shape('rect', { name: 'Book cover', x: 365, y: 605, width: 250, height: 190, fill: '#753e40', rotation: -8, zIndex: 2 }),
    shape('rect', { name: 'Left page', x: 380, y: 617, width: 111, height: 164, fill: '#f6f0e2', rotation: -8, zIndex: 3 }),
    shape('rect', { name: 'Right page', x: 494, y: 601, width: 106, height: 164, fill: '#d6cbbb', rotation: -8, zIndex: 3 }),
    text({ name: 'Illustration caption', text: 'A MONTHLY\nREADING JOURNAL', fontFamily: mono, fontSize: 14, color: '#403c37', x: 72, y: 730, width: 250, height: 50 }),
    shape('line', { name: 'Colophon rule', x: 72, y: 886, width: 668, height: 1.5, fill: '#403c37' }),
    text({ name: 'Editor credit', text: 'EDITED BY YOU\nNOVEMBER 2026', fontFamily: mono, fontSize: 15, color: '#403c37', x: 72, y: 910, width: 340, height: 50 }),
    text({ name: 'Edition number', text: 'VOL. 01 / 06', fontFamily: mono, fontSize: 15, color: '#753e40', x: 540, y: 910, width: 200, height: 30 }),
  ]),
];
