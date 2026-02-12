const fs = require('fs');
const zlib = require('zlib');

function crc32(buf) {
    let c = -1;
    for (let i = 0; i < buf.length; i++) {
        c ^= buf[i];
        for (let j = 0; j < 8; j++) {
            c = c >>> 1 ^ (c & 1 ? 0xEDB88320 : 0);
        }
    }
    return (c ^ -1) >>> 0;
}

function makeChunk(type, data) {
    const t = Buffer.from(type);
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const combined = Buffer.concat([t, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(combined));
    return Buffer.concat([len, t, data, crc]);
}

function makePNG(size, r, g, b) {
    const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size, 0);
    ihdr.writeUInt32BE(size, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 2; // color type RGB
    ihdr[10] = 0; // compression
    ihdr[11] = 0; // filter
    ihdr[12] = 0; // interlace

    const rows = [];
    for (let y = 0; y < size; y++) {
        const row = Buffer.alloc(size * 3 + 1);
        row[0] = 0; // filter none
        for (let x = 0; x < size; x++) {
            row[1 + x * 3] = r;
            row[2 + x * 3] = g;
            row[3 + x * 3] = b;
        }
        rows.push(row);
    }

    const raw = Buffer.concat(rows);
    const deflated = zlib.deflateSync(raw);
    const iend = Buffer.alloc(0);

    return Buffer.concat([
        sig,
        makeChunk('IHDR', ihdr),
        makeChunk('IDAT', deflated),
        makeChunk('IEND', iend)
    ]);
}

fs.writeFileSync('public/icon-192.png', makePNG(192, 0, 0x37, 0x7B));
fs.writeFileSync('public/icon-512.png', makePNG(512, 0, 0x37, 0x7B));
console.log('PWA icons created successfully!');
