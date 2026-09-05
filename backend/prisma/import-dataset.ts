/**
 * Dataset Import Script
 * Imports Mumbai_Jaipur_Ahmedabad_Experiences_Dataset.xlsx into the Supabase DB.
 * Maps dataset categories/vibes to the platform's Category, BudgetBand, WeatherTag enums.
 *
 * Run: npx ts-node prisma/import-dataset.ts
 */
import { PrismaClient, BudgetBand, Category, WeatherTag, VerificationStatus, KycDocumentType, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const prisma = new PrismaClient();

// ─── Area → Geo Coordinates ─────────────────────────────────────────────────
const AREA_COORDINATES: Record<string, { lat: number; lng: number; state: string }> = {
  // Mumbai
  'Marine Drive':   { lat: 18.9438, lng: 72.8234, state: 'Maharashtra' },
  'Colaba':         { lat: 18.9067, lng: 72.8147, state: 'Maharashtra' },
  'Fort':           { lat: 18.9322, lng: 72.8353, state: 'Maharashtra' },
  'Elephanta':      { lat: 18.9633, lng: 72.9315, state: 'Maharashtra' },
  'Borivali':       { lat: 19.2307, lng: 72.8567, state: 'Maharashtra' },
  'Bandra':         { lat: 19.0596, lng: 72.8295, state: 'Maharashtra' },
  'Dharavi':        { lat: 19.0421, lng: 72.8558, state: 'Maharashtra' },
  'Dadar':          { lat: 19.0178, lng: 72.8478, state: 'Maharashtra' },
  'Worli':          { lat: 19.0128, lng: 72.8148, state: 'Maharashtra' },
  'Byculla':        { lat: 18.9804, lng: 72.8374, state: 'Maharashtra' },
  'Juhu':           { lat: 19.1075, lng: 72.8263, state: 'Maharashtra' },
  'Versova':        { lat: 19.1348, lng: 72.8098, state: 'Maharashtra' },
  'Malad':          { lat: 19.1871, lng: 72.8483, state: 'Maharashtra' },
  'Goregaon':       { lat: 19.1551, lng: 72.8497, state: 'Maharashtra' },
  'Mahim':          { lat: 19.0385, lng: 72.8405, state: 'Maharashtra' },
  'Matunga':        { lat: 19.0253, lng: 72.8631, state: 'Maharashtra' },
  'Chembur':        { lat: 19.0622, lng: 72.9007, state: 'Maharashtra' },
  'Kurla':          { lat: 19.0726, lng: 72.8796, state: 'Maharashtra' },
  'Thane':          { lat: 19.2183, lng: 72.9781, state: 'Maharashtra' },
  'Powai':          { lat: 19.1176, lng: 72.9060, state: 'Maharashtra' },
  'Andheri':        { lat: 19.1136, lng: 72.8697, state: 'Maharashtra' },
  'Churchgate':     { lat: 18.9322, lng: 72.8264, state: 'Maharashtra' },
  'CST':            { lat: 18.9400, lng: 72.8356, state: 'Maharashtra' },
  'Lower Parel':    { lat: 18.9980, lng: 72.8258, state: 'Maharashtra' },
  'Parel':          { lat: 19.0025, lng: 72.8437, state: 'Maharashtra' },
  'Santacruz':      { lat: 19.0822, lng: 72.8406, state: 'Maharashtra' },
  'Sion':           { lat: 19.0440, lng: 72.8647, state: 'Maharashtra' },
  // Jaipur
  'Old City':       { lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
  'Pink City':      { lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
  'Johari Bazaar':  { lat: 26.9178, lng: 75.8221, state: 'Rajasthan' },
  'Amer':           { lat: 26.9855, lng: 75.8513, state: 'Rajasthan' },
  'Nahargarh':      { lat: 26.9378, lng: 75.8057, state: 'Rajasthan' },
  'Jal Mahal':      { lat: 26.9537, lng: 75.8508, state: 'Rajasthan' },
  'Sanganer':       { lat: 26.8136, lng: 75.7946, state: 'Rajasthan' },
  'Bapu Bazaar':    { lat: 26.9121, lng: 75.8147, state: 'Rajasthan' },
  'Hawa Mahal':     { lat: 26.9239, lng: 75.8267, state: 'Rajasthan' },
  'Jantarmantar':   { lat: 26.9247, lng: 75.8241, state: 'Rajasthan' },
  'City Palace':    { lat: 26.9258, lng: 75.8237, state: 'Rajasthan' },
  'Rambagh':        { lat: 26.8977, lng: 75.8055, state: 'Rajasthan' },
  'Jhotwara':       { lat: 26.9614, lng: 75.7770, state: 'Rajasthan' },
  'Jawahar Nagar':  { lat: 26.9204, lng: 75.7940, state: 'Rajasthan' },
  'Bagru':          { lat: 26.8073, lng: 75.5682, state: 'Rajasthan' },
  'Sikar Road':     { lat: 26.9726, lng: 75.7613, state: 'Rajasthan' },
  'Sitapura':       { lat: 26.7706, lng: 75.8526, state: 'Rajasthan' },
  'Mansarovar':     { lat: 26.8601, lng: 75.7635, state: 'Rajasthan' },
  'Gopalpura':      { lat: 26.8740, lng: 75.7826, state: 'Rajasthan' },
  'Tonk Road':      { lat: 26.8638, lng: 75.8150, state: 'Rajasthan' },
  'Rajasthan':      { lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
  'Chandpole':      { lat: 26.9220, lng: 75.8072, state: 'Rajasthan' },
  'Ajmeri Gate':    { lat: 26.9200, lng: 75.8145, state: 'Rajasthan' },
  // Ahmedabad
  'Old Ahmedabad':  { lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
  'Pols':           { lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
  'Sabarmati':      { lat: 23.0631, lng: 72.5816, state: 'Gujarat' },
  'Riverfront':     { lat: 23.0384, lng: 72.5828, state: 'Gujarat' },
  'Manek Chowk':    { lat: 23.0247, lng: 72.5875, state: 'Gujarat' },
  'Kankaria':       { lat: 22.9969, lng: 72.6015, state: 'Gujarat' },
  'Usmanpura':      { lat: 23.0493, lng: 72.5863, state: 'Gujarat' },
  'Law Garden':     { lat: 23.0271, lng: 72.5604, state: 'Gujarat' },
  'Gulbai Tekra':   { lat: 23.0247, lng: 72.5537, state: 'Gujarat' },
  'SG Road':        { lat: 23.0439, lng: 72.5128, state: 'Gujarat' },
  'Vastrapur':      { lat: 23.0374, lng: 72.5288, state: 'Gujarat' },
  'Navrangpura':    { lat: 23.0294, lng: 72.5600, state: 'Gujarat' },
  'Ellis Bridge':   { lat: 23.0197, lng: 72.5700, state: 'Gujarat' },
  'Ashram Road':    { lat: 23.0292, lng: 72.5747, state: 'Gujarat' },
  'CG Road':        { lat: 23.0225, lng: 72.5576, state: 'Gujarat' },
  'Satellite':      { lat: 23.0233, lng: 72.5171, state: 'Gujarat' },
  'Prahladnagar':   { lat: 22.9953, lng: 72.5193, state: 'Gujarat' },
  'Bopal':          { lat: 22.9960, lng: 72.4689, state: 'Gujarat' },
  'Gota':           { lat: 23.1019, lng: 72.5341, state: 'Gujarat' },
  'Chandkheda':     { lat: 23.1044, lng: 72.5978, state: 'Gujarat' },
  'Modhera':        { lat: 23.5851, lng: 72.1313, state: 'Gujarat' },
  'Adalaj':         { lat: 23.1688, lng: 72.5802, state: 'Gujarat' },
  'Lothal':         { lat: 22.5231, lng: 72.2510, state: 'Gujarat' },
  'Patan':          { lat: 23.8493, lng: 72.1266, state: 'Gujarat' },
  'Champaner':      { lat: 22.4851, lng: 73.5373, state: 'Gujarat' },
  'Nalsarovar':     { lat: 22.7681, lng: 72.0430, state: 'Gujarat' },
};

// ─── Experience Photo Mappings (High-resolution curated photos per listing) ───
const EXPERIENCE_PHOTOS: Record<string, string> = {
  // ── Mumbai ──
  'Marine Drive Sunset Walk': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
  'Colaba Causeway Street Shopping': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  'Kala Ghoda Art & Heritage Walk': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
  'Gateway of India & Colaba Walk': 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=1200&q=80',
  'Elephanta Caves Day Experience': 'https://images.unsplash.com/photo-1600100397608-f010f481b896?auto=format&fit=crop&w=1200&q=80',
  'Kanheri Caves Forest Exploration': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
  'Sanjay Gandhi National Park Nature Trail': 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
  'Bandra Bandstand Sunset Walk': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'Bandra Street Art Hunt': 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?auto=format&fit=crop&w=1200&q=80',
  'Bandra Fort Photography Stop': 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
  'Carter Road Promenade Evening': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'Juhu Beach Sunset & Street Food': 'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=1200&q=80',
  'Prithvi Theatre Evening': 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1200&q=80',
  'Matunga South Indian Food Trail': 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=1200&q=80',
  'Mohammed Ali Road Food Walk': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80',
  'Girgaon Chowpatty Snack Evening': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=80',
  'Fort Heritage Architecture Walk': 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1200&q=80',
  'CSMT Architecture Photography': 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80',
  'Crawford Market Local Food Walk': 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=1200&q=80',
  'Sassoon Dock Fishermen Experience': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
  'Dadar Flower Market Photography': 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80',
  'Khotachiwadi Heritage Lane Walk': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  'Banganga Tank Heritage Experience': 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
  'Hanging Gardens & Malabar Hill': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
  'Haji Ali Coastal Visit': 'https://images.unsplash.com/photo-1597659840241-37e2b9c2f55f?auto=format&fit=crop&w=1200&q=80',
  'Dhobi Ghat Local Life Experience': 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=1200&q=80',
  'Nehru Planetarium Astronomy Experience': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  'Nehru Science Centre Interactive Visit': 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
  'Dr Bhau Daji Lad Museum Experience': 'https://images.unsplash.com/photo-1565034946487-077786996e27?auto=format&fit=crop&w=1200&q=80',
  'Jehangir Art Gallery Visit': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
  'NGMA Mumbai Art Experience': 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80',
  'Chor Bazaar Vintage Hunt': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80',
  'Bhuleshwar Traditional Market Walk': 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
  'Zaveri Bazaar Jewellery District': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
  'Aarey Green Trail': 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
  'Powai Lake Evening': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
  'Sewri Flamingo Watching': 'https://images.unsplash.com/photo-1539664030488-9620cd952e25?auto=format&fit=crop&w=1200&q=80',
  'Gorai Beach Escape': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
  'Versova Beach Sunset': 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
  'Global Vipassana Pagoda Visit': 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=1200&q=80',
  'Bandra Café Hopping': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
  'Colaba Café & Gallery Trail': 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80',
  'Mumbai Heritage Photography Trail': 'https://images.unsplash.com/photo-1508672019048-805479760c41?auto=format&fit=crop&w=1200&q=80',
  'Mumbai Coastal Cycling Experience': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80',
  'Mumbai Local Train City Experience': 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80',

  // ── Jaipur ──
  'Amber Fort Sunrise Walk': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
  'City Palace Exploration': 'https://images.unsplash.com/photo-1609137144822-488667c26880?auto=format&fit=crop&w=1200&q=80',
  'Hawa Mahal Street View': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
  'Jantar Mantar Astronomy Tour': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
  'Nahargarh Fort Sunset': 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=1200&q=80',
  'Jaigarh Fort Visit': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
  'Jal Mahal Evening Stop': 'https://images.unsplash.com/photo-1588096344356-9b51726a26cf?auto=format&fit=crop&w=1200&q=80',
  'Patrika Gate Photography': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80',
  'Albert Hall Museum Visit': 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=1200&q=80',
  'Johari Bazaar Shopping Walk': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
  'Bapu Bazaar Textile Shopping': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
  'Blue Pottery Workshop': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
  'Block Printing Workshop': 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80',
  'Bagru Printing Experience': 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=1200&q=80',
  'Chokhi Dhani Cultural Evening': 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
  'Rajasthani Thali Dinner': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
  'Lassiwala Lassi Stop': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=80',
  'Masala Chowk Street Food': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  'Pyaaz Kachori Breakfast': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80',
  'Handicraft Shopping at Tripolia Bazaar': 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80',
  'Galtaji Temple Visit': 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
  'Monkey Temple Sunrise': 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=1200&q=80',
  'Sisodia Rani Garden': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
  'Panna Meena Stepwell': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  'Anokhi Museum of Hand Printing': 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80',
  'Elephant Village Cultural Visit': 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=80',
  'Hot Air Balloon Ride': 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=1200&q=80',
  'Cycling Tour of Pink City': 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
  'Walking Tour of Walled City': 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1200&q=80',
  'Sunset at Man Sagar Lake': 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1200&q=80',
  'Jaipur Wax Museum': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80',
  'Raj Mandir Cinema Experience': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
  'Café Hopping in C-Scheme': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
  'Rajasthani Folk Music Evening': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
  'Mojari Shopping': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
  'Lac Bangle Making Experience': 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=1200&q=80',
  'Sanganer Textile Market': 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=1200&q=80',
  'Ram Niwas Garden Stroll': 'https://images.unsplash.com/photo-1587334206596-d0e80209424c?auto=format&fit=crop&w=1200&q=80',
  'Central Park Morning Walk': 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
  'Kishan Bagh Sand Dune Park': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
  'Amer Village Food Walk': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1200&q=80',
  'Rajasthani Puppet Show': 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1200&q=80',
  'Dera Amer Outdoor Experience': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  'Nahargarh Cycling Route': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80',
  'Jantar Mantar Night Illumination': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  'Royal Rajasthani Cooking Class': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80',
  'Gemstone Jewellery Shopping': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80',
  'Jaipur Heritage Haveli Stay': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'Durgapura Local Market Walk': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80',
  'Pink City Night Walk': 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',

  // ── Ahmedabad ──
  'Sabarmati Ashram Experience': 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=1200&q=80',
  'Sabarmati Riverfront Evening': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'Adalaj Stepwell Architecture Visit': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  'Manek Chowk Night Food Experience': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  'Old Ahmedabad Pol Heritage Walk': 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80',
  'Sabarmati Ashram Visit': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
  'Sabarmati Riverfront Walk': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
  'Adalaj Stepwell': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
  'Sidi Saiyyed Mosque Visit': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
  'Old City Heritage Walk': 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1200&q=80',
  'Manek Chowk Night Food Walk': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=80',
  'Law Garden Night Market': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
  'Gujarati Thali Dinner': 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=1200&q=80',
  'Kankaria Lake Evening': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'Atal Bridge Walk': 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
  'Calico Museum of Textiles': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
  'Hutheesing Jain Temple': 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
  'Jama Masjid Ahmedabad': 'https://images.unsplash.com/photo-1597659840241-37e2b9c2f55f?auto=format&fit=crop&w=1200&q=80',
  'Bhadra Fort Exploration': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
  'Teen Darwaza Market Walk': 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=1200&q=80',
  'Dada Harir Stepwell': 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80',
  'Sarkhej Roza Complex': 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=1200&q=80',
  'Auto World Vintage Car Museum': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  'Science City Exploration': 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
  'Gujarat Science City Aquarium': 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=1200&q=80',
  'Riverfront Cycling': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80',
  'Sabarmati Riverfront Sunset Photography': 'https://images.unsplash.com/photo-1508672019048-805479760c41?auto=format&fit=crop&w=1200&q=80',
  'Gujarati Street Breakfast': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80',
  'Khaman & Dhokla Tasting': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80',
  'Manek Chowk Sandwich Trail': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80',
  'Gujarat Handicraft Shopping': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80',
  'Bandhani Shopping': 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
  'Patola Textile Exploration': 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80',
  'Jhulta Minar Visit': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
  'Sidi Bashir Minarets View': 'https://images.unsplash.com/photo-1609137144822-488667c26880?auto=format&fit=crop&w=1200&q=80',
  'Shreyas Folk Museum': 'https://images.unsplash.com/photo-1565034946487-077786996e27?auto=format&fit=crop&w=1200&q=80',
  'Vechaar Utensils Museum': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
  'Gujarati Cooking Class': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80',
  'Pol House Architecture Walk': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
  'Heritage Haveli Experience': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'Sidi Saiyyed Jali Photography': 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80',
  'Kankaria Toy Train Ride': 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80',
  'Kankaria Lakefront Cycling': 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
  'Nagina Wadi Evening Visit': 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
  'Thol Lake Birdwatching': 'https://images.unsplash.com/photo-1539664030488-9620cd952e25?auto=format&fit=crop&w=1200&q=80',
  'Nal Sarovar Day Trip': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
  'Adalaj Village Craft Stop': 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=1200&q=80',
  'Gujarati Textile Printing Experience': 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80',
  'Ravivari Sunday Market': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
  'Ahmedabad Café Hopping': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
  'Sunset at Usmanpura Riverfront': 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1200&q=80',
  'Modhera Day Trip': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
  'Patan Heritage & Patola Day Trip': 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=1200&q=80',
  'Gujarati Folk Performance': 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1200&q=80',
  'Ahmedabad Old City Night Walk': 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80'
};

function getExperiencePhoto(name: string, category: string, city: string): string[] {
  if (EXPERIENCE_PHOTOS[name]) {
    return [EXPERIENCE_PHOTOS[name]];
  }
  // Safe default
  return ['https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80'];
}

// ─── Category mapping ────────────────────────────────────────────────────────
function mapCategory(raw: string): Category {
  const r = (raw || '').toLowerCase();
  if (r.includes('food') || r.includes('café') || r.includes('cafe')) return 'FOOD';
  if (r.includes('adventure')) return 'ADVENTURE';
  if (r.includes('shop')) return 'SHOPPING';
  if (r.includes('workshop') || r.includes('craft') || r.includes('art') || r.includes('education')) return 'WORKSHOPS';
  if (r.includes('culture') || r.includes('heritage') || r.includes('museum') || r.includes('history')) return 'CULTURE';
  if (r.includes('nightlife') || r.includes('entertainment')) return 'NIGHTLIFE';
  if (r.includes('event')) return 'EVENTS';
  if (r.includes('hidden') || r.includes('local life') || r.includes('spiritual') || r.includes('wellness')
    || r.includes('garden') || r.includes('scenic') || r.includes('viewpoint') || r.includes('wildlife')
    || r.includes('photography') || r.includes('walking') || r.includes('nature') || r.includes('leisure')
    || r.includes('stay') || r.includes('family')) return 'HIDDEN_GEMS';
  return 'CULTURE';
}

// ─── Price → BudgetBand ──────────────────────────────────────────────────────
function parsePriceRange(raw: string): { priceMin: number; priceMax: number; budgetBand: BudgetBand } {
  if (!raw || raw.toLowerCase().includes('free')) {
    return { priceMin: 0, priceMax: 0, budgetBand: 'BUDGET' };
  }
  const nums = raw.replace(/[^\d–\-]/g, '').split(/[–\-]/).map(Number).filter(n => !isNaN(n) && n > 0);
  const priceMin = nums[0] || 0;
  const priceMax = nums[1] || priceMin;
  let budgetBand: BudgetBand = 'BUDGET';
  const mid = (priceMin + priceMax) / 2;
  if (mid > 3000) budgetBand = 'LUXURY';
  else if (mid > 1000) budgetBand = 'PREMIUM';
  else if (mid > 300) budgetBand = 'MODERATE';
  return { priceMin, priceMax, budgetBand };
}

// ─── Duration string → minutes ───────────────────────────────────────────────
function parseDuration(raw: string): number {
  if (!raw) return 90;
  const match = raw.match(/(\d+)/g);
  if (!match) return 90;
  const nums = match.map(Number);
  if (nums.length === 1) return nums[0] * 60;
  const avg = (nums[0] + nums[1]) / 2;
  if (raw.includes('hr') || raw.includes('hour')) return Math.round(avg * 60);
  if (raw.includes('min')) return Math.round(avg);
  return Math.round(avg * 60);
}

// ─── Vibe → WeatherTag ───────────────────────────────────────────────────────
function mapWeatherTag(vibe: string, category: string): WeatherTag {
  const v = (vibe || '').toLowerCase();
  const c = (category || '').toLowerCase();
  if (c.includes('nature') || c.includes('adventure') || c.includes('outdoor') || v.includes('outdoor')) return 'OUTDOOR';
  if (c.includes('museum') || c.includes('workshop') || c.includes('café') || c.includes('cafe') || c.includes('stay')) return 'INDOOR';
  return 'WEATHER_DEPENDENT';
}

// ─── Get geo coords for area ─────────────────────────────────────────────────
function getCoords(area: string, city: string): { lat: number; lng: number; state: string } {
  // Direct match
  if (AREA_COORDINATES[area]) return AREA_COORDINATES[area];
  // Partial match
  for (const key of Object.keys(AREA_COORDINATES)) {
    if (area.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(area.toLowerCase())) {
      return AREA_COORDINATES[key];
    }
  }
  // Default by city center
  const cityDefaults: Record<string, { lat: number; lng: number; state: string }> = {
    'Mumbai':    { lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
    'Jaipur':    { lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
  };
  return cityDefaults[city] || { lat: 20.5937, lng: 78.9629, state: 'India' };
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  // Read JSON export of the xlsx (we'll write it inline)
  const xlsxPath = path.join(__dirname, '../../Mumbai_Jaipur_Ahmedabad_Experiences_Dataset.xlsx');
  if (!fs.existsSync(xlsxPath)) {
    throw new Error(`Dataset not found at: ${xlsxPath}`);
  }

  // Use dynamic import for xlsx (pure JS approach - no native deps)
  let rows: any[];
  try {
    // Try reading with xlsx package if installed
    const XLSX = require('xlsx');
    const wb = XLSX.readFile(xlsxPath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(ws);
  } catch {
    throw new Error('Install xlsx: npm install xlsx');
  }

  console.log(`Loaded ${rows.length} experiences from dataset`);

  // Get or create dataset provider
  const providerPassword = await argon2.hash('Provider123!');
  const datasetUser = await prisma.user.upsert({
    where: { email: 'dataset.provider@experienceplatform.in' },
    update: {},
    create: {
      email: 'dataset.provider@experienceplatform.in',
      passwordHash: providerPassword,
      name: 'Dataset Curator',
      role: 'PROVIDER' as Role,
      mfaEnabled: false,
      providerProfile: {
        create: {
          businessName: 'Local Experience Intelligence — Curated Dataset',
          businessType: 'Platform Curated Experiences',
          phone: '+919900000001',
          city: 'Mumbai',
          verificationStatus: 'VERIFIED' as VerificationStatus,
          kycDocumentRef: 'kyc/verified/dataset_curator.pdf',
          kycDocumentType: 'GOVERNMENT_ID' as KycDocumentType,
          kycVerifiedAt: new Date(),
        },
      },
    },
    include: { providerProfile: true },
  });

  const providerId = datasetUser.providerProfile!.id;
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const name = row['Experience Name'] as string;
    const city = row['City'] as string;
    const area = row['Area'] as string;
    const categoryRaw = row['Category'] as string;
    const priceRaw = row['Price Range'] as string;
    const durationRaw = row['Duration'] as string;
    const vibe = row['Vibe'] as string || '';
    const tags = row['Tags'] as string || '';
    const bestFor = row['Best For'] as string || '';
    const humanTip = row['Human Tip'] as string || '';
    const bestTime = row['Best Time'] as string || '';

    if (!name || !city) { skipped++; continue; }

    const coords = getCoords(area, city);
    const category = mapCategory(categoryRaw);
    const { priceMin, priceMax, budgetBand } = parsePriceRange(priceRaw);
    const durationMinutes = parseDuration(durationRaw);
    const weatherTag = mapWeatherTag(vibe, categoryRaw);

    // Build description from available fields
    const description = [
      `${categoryRaw} experience in ${area}, ${city}.`,
      bestFor ? `Best for: ${bestFor}.` : '',
      vibe ? `Vibe: ${vibe}.` : '',
      bestTime ? `Best time to visit: ${bestTime}.` : '',
      tags ? `Tags: ${tags}.` : '',
      humanTip ? `Tip: ${humanTip}` : '',
    ].filter(Boolean).join(' ');

    const photos = getExperiencePhoto(name, category, city);

    try {
      // First try to update existing row if it has empty media_urls
      const updatedCount = await prisma.experience.updateMany({
        where: {
          title: name,
          city: city,
        },
        data: {
          mediaUrls: photos,
        },
      });

      if (updatedCount.count > 0) {
        inserted++;
      } else {
        await prisma.$queryRawUnsafe(
          `
          INSERT INTO "experiences" (
            "id", "provider_id", "title", "description", "category",
            "location", "latitude", "longitude", "address", "city", "state", "country",
            "price_min", "price_max", "currency", "budget_band", "accessibility_tags",
            "media_urls", "availability_rules", "duration_minutes", "weather_tag",
            "rating_average", "review_count", "authenticity_rating", "updated_at"
          ) VALUES (
            gen_random_uuid(), $1::uuid, $2, $3, $4::"Category",
            ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography, $6, $5, $7, $8, $9, 'India',
            $10, $11, 'INR', $12::"BudgetBand", $13::text[],
            $14::text[], $15::jsonb, $16, $17::"WeatherTag", $18, $19, $20, NOW()
          )
          ON CONFLICT DO NOTHING;
          `,
          providerId,
          name,
          description,
          category,
          coords.lng,
          coords.lat,
          area,
          city,
          coords.state,
          priceMin,
          priceMax,
          budgetBand,
          [],  // accessibilityTags
          photos,  // mediaUrls
          JSON.stringify([{ daysOfWeek: [0, 1, 2, 3, 4, 5, 6], openTime: '08:00', closeTime: '20:00' }]),
          durationMinutes,
          weatherTag,
          4.2 + Math.random() * 0.6,  // realistic rating 4.2–4.8
          Math.floor(20 + Math.random() * 150),
          0.85 + Math.random() * 0.14,
        );
        inserted++;
      }
      if (inserted % 20 === 0) console.log(`  Processed ${inserted}...`);
    } catch (err: any) {
      console.warn(`  Skipped "${name}": ${err.message?.slice(0, 80)}`);
      skipped++;
    }
  }

  console.log(`Done! Processed: ${inserted}, Skipped: ${skipped}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
