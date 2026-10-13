// Pixel-art sprites: one character per pixel, '.' is transparent.
// Canvases are built lazily so this module also loads in tests (no DOM needed until drawing).

export const BASEPAL = {
  K: '#111114', W: '#ffffff', Y: '#ffd23f', D: '#d08a12', G: '#ffc83d', P: '#ff5fa8', p: '#ffc2de',
  R: '#9a9ab0', T: '#2a2a32', B: '#8fd3ff', V: '#2a3f8f', N: '#e10600', H: '#ffd23f', S: '#ececf2', L: '#d9dde6'
}

const CAR = [
  'KKKK....................',
  'KAAK....................',
  'KAAK.......KKK..........',
  '.KCK......KHHHK.........',
  '.KCCCCCCCKHWWHKCCCCC....',
  'KCCCCCCCCCCCCCCCCCCAAAKK',
  'KCCKKKCCCCCCCCCCKKKCCCCK',
  'KKKTTTKKKKKKKKKKTTTKKKKK',
  '..KTRTK.........KTRTK...',
  '..KTTTK.........KTTTK...',
  '...KKK...........KKK....'
]

export const SPRITES = {
  heart: { name: 'Heart', rows: ['.KK...KK.', 'KNNK.KNNK', 'KNWNKNNNK', 'KNNNNNNNK', '.KNNNNNK.', '..KNNNK..', '...KNK...', '....K....'] },
  star: { name: 'Star', rows: ['.....K.....', '....KYK....', '....KYK....', 'KKKKYYYKKKK', 'KYYYYWYYYYK', '.KYYYYYYYK.', '..KYYYYYK..', '.KYYYKYYYK.', '.KYYK.KYYK.', 'KYKK...KKYK', 'KK.......KK'] },
  flag: { name: 'Checkered', rows: ['K.............', 'KKKKKKKKKKKKK.', 'KWWTTWWTTWWTK.', 'KWWTTWWTTWWTK.', 'KTTWWTTWWTTWK.', 'KTTWWTTWWTTWK.', 'KWWTTWWTTWWTK.', 'KWWTTWWTTWWTK.', 'KKKKKKKKKKKKK.', 'K.............', 'K.............', 'K.............', 'KK............'] },
  trophy: { name: 'Trophy', rows: ['..KKKKKKKK..', 'KKKGGGGGGKKK', 'KGKGGWGGGKGK', 'KGKGGWGGGKGK', '.KKGGGGGGKK.', '...KGGGGK...', '....KGGK....', '.....KK.....', '....KGGK....', '...KKKKKK...', '...KDDDDK...', '...KKKKKK...'] },
  coin: { name: 'Coin', rows: ['..KKKK..', '.KYYYYK.', 'KYYWYYDK', 'KYYWYYDK', 'KYYWYYDK', 'KYYWYYDK', '.KDYYDK.', '..KKKK..'] },
  capsule: { name: 'Capsule', rows: ['...KKKK...', '..KNNNNK..', '.KNWNNNNK.', 'KNWNNNNNNK', 'KNNNNNNNNK', 'KKKKKKKKKK', 'KSSSSSSSSK', 'KSSSSSSSSK', '.KSSSSSSK.', '..KSSSSK..', '...KKKK...'] },
  capsuleP: { name: 'Pink capsule', rows: ['...KKKK...', '..KPPPPK..', '.KPWPPPPK.', 'KPWPPPPPPK', 'KPPPPPPPPK', 'KKKKKKKKKK', 'KSSSSSSSSK', 'KSSSSSSSSK', '.KSSSSSSK.', '..KSSSSK..', '...KKKK...'] },
  crown: { name: 'Crown', rows: ['K....K....K', 'KK..KYK..KK', 'KYKKYYYKKYK', 'KYYYYYYYYYK', 'KYNYYBYYNYK', 'KYYYYYYYYYK', 'KKKKKKKKKKK'] },
  helmet: { name: 'Helmet', rows: ['...KKKKKK...', '..KNNNNNNK..', '.KNNNNNNNNK.', 'KNNNWWWWWNNK', 'KNNKVVVVVKNK', 'KNNKVVBVVKNK', 'KNNNKKKKKNNK', 'KNNNNNNNNNKK', '.KKKKKKKKKK.'] },
  lights: { name: 'Start lights', rows: ['......KKKK......', 'KKKKKKKKKKKKKKKK', 'KNNKNNKNNKNNKNNK', 'KNNKNNKNNKNNKNNK', 'KKKKKKKKKKKKKKKK'] },
  bow: { name: 'Bow', rows: ['KK.........KK', 'KNKK.....KKNK', 'KNNNKK.KKNNNK', 'KNNWNKKKNWNNK', 'KNNNKKNKKNNNK', 'KNKK.KNK.KKNK', 'KK...KNK...KK', '.....K.K.....'] },
  bowP: { name: 'Pink bow', rows: ['KK.........KK', 'KPKK.....KKPK', 'KPPPKK.KKPPPK', 'KPPpPKKKPpPPK', 'KPPPKKPKKPPPK', 'KPKK.KPK.KKPK', 'KK...KPK...KK', '.....K.K.....'] },
  sparkle: { name: 'Sparkle', rows: ['...K...', '...W...', '..WWW..', 'KWWWWWK', '..WWW..', '...W...', '...K...'] },
  bolt: { name: 'Bolt', rows: ['...KKKK', '..KYYK.', '..KYK..', '.KYYKKK', '.KYYYYK', 'KKKYYK.', '..KYK..', '.KYK...', '.KK....'] },
  wing: { name: 'Wing', rows: ['.........KK.', '.......KKWWK', '.....KKWWWWK', '...KKWWWWWWK', '..KWWWWWWWK.', '.KWWWWWWWK..', 'KWWWWWKKK...', 'KWWWKK......', '.KKK........'] },
  cloud: { name: 'Cloud', rows: ['.....KKKK.....', '...KKWWWWKK...', '..KWWWWWWWWK..', '.KWWWWWWWWWWKK', 'KWWWWWWWWWWWWK', 'KWWWWWWWWWLLLK', '.KKKKKKKKKKKK.'] },
  note: { name: 'Note', pal: { N: '#ffffff' }, rows: ['...KKKKK', '...KNNNK', '...KKKKK', '...K...K', '...K...K', '...K...K', '.KKK.KKK', 'KNNKKNNK', 'KNNKKNNK', '.KK..KK.'] },
  tire: { name: 'Tire', rows: ['..KKKKKK..', '.KTTTTTTK.', 'KTTRRRRTTK', 'KTRRKKRRTK', 'KTRKNNKRTK', 'KTRKNNKRTK', 'KTRRKKRRTK', 'KTTRRRRTTK', '.KTTTTTTK.', '..KKKKKK..'] }
}

export const CAR_COLORS = [
  ['carRed', 'Hoonrari car', '#e10600', '#ffffff'],
  ['carPink', 'Alpinoo car', '#ff8cc6', '#2c9bff'],
  ['carSilver', 'Meowcedes car', '#c9ccd6', '#111114'],
  ['carNavy', 'Jaybull car', '#1b2a5a', '#e10600'],
  ['carOrange', 'McJakey car', '#ff8a00', '#111114'],
  ['carGreen', 'Rikston car', '#0e6b4f', '#3fd18f']
]
for (const [key, name, body, accent] of CAR_COLORS) SPRITES[key] = { name, rows: CAR, pal: { C: body, A: accent } }

for (const s of Object.values(SPRITES)) {
  s.cols = Math.max(...s.rows.map(r => r.length))
  s.nrows = s.rows.length
}

export function spriteCanvas(key) {
  const s = SPRITES[key]
  if (s.canvas) return s.canvas
  const c = document.createElement('canvas')
  c.width = s.cols
  c.height = s.nrows
  const x = c.getContext('2d')
  const pal = { ...BASEPAL, ...(s.pal || {}) }
  s.rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const ch = row[i]
      if (ch === '.') continue
      x.fillStyle = pal[ch] || '#f0f'
      x.fillRect(i, j, 1, 1)
    }
  })
  s.canvas = c
  return c
}
