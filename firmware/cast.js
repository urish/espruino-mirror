if (!g.__origFlip) {
  g.__origFlip = g.flip;
}

NRF.setServices(
  {
    0xfeed: {
      0xfe01: {
        value: new Uint16Array([g.getWidth()]).buffer,
        description: 'Screen width (pixels)',
        readable: true,
      },
      0xfe02: {
        value: new Uint16Array([g.getHeight()]).buffer,
        description: 'Screen height (pixels)',
        readable: true,
      },
      0xfeed: {
        value: new Uint8Array(20).buffer,
        // maxLen: 20,
        description: 'Mirror bit-stream',
        readable: true,
        notify: true,
      },
    },
  },
  { advertise: ['FEED'], uart: true },
);

let casting = false;
NRF.on('connect', function() {
  casting = true;
});

NRF.on('disconnect', () => (casting = false));

g.flip = function() {
  const buf = new Uint8Array(g.buffer);
  if (casting) {
    let chunkSize = 19;
    for (let i = 0; i < buf.length; i += chunkSize, chunkSize = 20) {
      const val = buf.slice(i, i + chunkSize);
      NRF.updateServices({
        0xfeed: {
          0xfeed: {
            value: val,
            notify: true,
          },
        },
      });
    }
  }
  g.__origFlip();
};
