const fs = require('fs');
const path = require('path');

const root = __dirname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

let pass = 0, fail = 0;

function check(label, condition, detail = '') {
  if (condition) {
    console.log('PASS: ' + label);
    pass++;
  } else {
    console.log('FAIL: ' + label + (detail ? ' | ' + detail : ''));
    fail++;
  }
}

// STEP 1 — HTML ENCODING
check('meta charset UTF-8', html.includes('<meta charset="UTF-8">'));
check('DOCTYPE html', html.includes('<!DOCTYPE html>'));
check('html lang en', html.includes('<html lang="en">'));

// STEP 3 — GOOGLE RATING
check('4.6 in hero rating score', html.includes('<span class="rating-score">4.6</span>'));
check('391 Google Reviews in hero', html.includes('<span class="rating-count">391 Google Reviews</span>'));
check('4.6 ★ in drawer', html.includes('<strong>4.6 ★</strong> &nbsp;·&nbsp; 391 Google Reviews'));
check('4.6 ★ in footer', html.includes('Rated <strong>4.6 ★</strong> &nbsp;&middot;&nbsp; <strong>391 Google Reviews</strong>'));
check('No 4.6★ without space in meta tags', !html.includes('4.6★'));

// STEP 4 — REVIEW STARS
const star5 = '★★★★★';
check('5 stars in hero rating pill', html.includes('<div class="rating-stars">' + star5 + '</div>'));
check('5 stars in score-stars', html.includes('<div class="score-stars">' + star5 + '</div>'));
check('5 stars review card Pandi', html.includes(star5));

// STEP 5 — HERO SECTION
check('JK DRIVING SCHOOL bullet MANNIVAKKAM', html.includes('JK DRIVING SCHOOL • MANNIVAKKAM, SH 48'));

// STEP 6 — RATED ACADEMY CARD
check('4.6 ★ Rated Academy (with space)', html.includes('<h3 class="trust-card-title">4.6 ★ Rated Academy</h3>'));
check('Trusted by 391+ Google Reviews', html.includes('Trusted by 391+ Google Reviews'));

// STEP 7 — GOOGLE REVIEWS SECTION
check('Review Pandi Diraviam text', html.includes('"Very well coaching and personal driving experience sharing, good communication"'));
check('Review Ameer Basha text', html.includes('"Very good service, affordable price."'));
check('Review Sivakanthavel text', html.includes('"Timing was followed strictly here. They will not wait even for 5 mins."'));

// STEP 8 — BUSINESS HOURS
check('Hours MON – SAT', html.includes('MON – SAT'));
check('Hours 5:30 AM – 8:00 PM', html.includes('5:30 AM – 8:00 PM'));
check('Sunday Holiday Closed', html.includes('Sunday: Holiday / Closed'));

// STEP 9 — LOCATION SECTION
check('Clean address 183, SH 48', html.includes('<strong>183, SH 48</strong>, Shanmuga Nagar,<br />'));
check('No duplicate location-tamil element', !html.includes('class="location-tamil"'));

// STEP 10 — SEARCH ENTIRE CODEBASE FOR CORRUPTION
const filesToCheck = ['index.html', 'script.js', 'style.css', 'theme-switcher.js', 'server.js', '_svc_new.html'];
let anyCorrupt = false;
let anyBom = false;

filesToCheck.forEach(file => {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath);
  
  // Check BOM
  if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) {
    anyBom = true;
    console.log('BOM detected in ' + file);
  }

  // Check corrupted characters
  const text = raw.toString('utf8');
  const badChars = ['â', 'Ã', 'Â', '\ufffd'];
  badChars.forEach(ch => {
    if (text.includes(ch)) {
      anyCorrupt = true;
      console.log('Corrupted char "' + ch + '" found in ' + file);
    }
  });
});

check('Zero corrupted characters (â, Ã, Â, \ufffd) across codebase', !anyCorrupt);
check('Zero BOMs across codebase (UTF-8 without BOM)', !anyBom);

console.log('\n=== RESULTS: ' + pass + ' PASS, ' + fail + ' FAIL ===');
if (fail > 0) process.exit(1);

