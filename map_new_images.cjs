const fs = require('fs');

const path = 'src/data/catalogData.ts';
let content = fs.readFileSync(path, 'utf8');

const imageMappings = {
  'p1': '/images/amd_ryzen_7_7800x3d.jpg',
  'p2': '/images/intel_core_i9_14900ks.jpg',
  'p3': '/images/amd_ryzen_5_7600x.jpg',
  'p4': '/images/gigabyte_rtx_4090_aero.jpg',
  'p5': '/images/asus_rog_strix_rtx_4080_super.jpg',
  'p6': '/images/sapphire_rx_7900_xtx.jpg',
  'p7': '/images/asus_rog_strix_z790_a.jpg',
  'p8': '/images/msi_mag_b650_tomahawk.jpg',
  'p9': '/images/gskill_trident_z5_rgb.jpg',
  'p10': '/images/kingston_fury_renegade.jpg',
  'p11': '/images/samsung_990_pro.jpg',
  // p12 has no image uploaded
  'p13': '/images/corsair_rm1000x_shift.jpg',
  'p14': '/images/deepcool_px1200g.jpg'
};

for (const [id, imagePath] of Object.entries(imageMappings)) {
  const regex = new RegExp(`(id:\\s*'${id}',[\\s\\S]*?image:\\s*')[^']+(\')`);
  content = content.replace(regex, `$1${imagePath}$2`);
}

fs.writeFileSync(path, content, 'utf8');
