/**
 * Comprehensive CRUT Mo Bus Routes & Stoppages Dataset
 * All 60+ Routes with detailed intermediate stops & dynamic stop locator
 */

export interface MoBusDetailRoute {
  route: string;
  start: string;
  destination: string;
  stops: string;
  stopsList: string[];
}

export const MO_BUS_DETAILED_ROUTES: MoBusDetailRoute[] = [
  {
    route: "09",
    start: "Bhubaneswar Railway Station",
    destination: "Patia",
    stops: "Master canteen Janpath, sriya square, ram mandir, exhibition ground, bhimabhoi school, housing boards square, rotary bhabwan, nico park square, anand bazar, acharay vihar square, immt, jaydev vihar square, pal height, may fair road, janta maidan, xavier square, fortune tower, kaling hospital square, rail sadan, omfed square, bda colony, care hospital, Lumbini vihar, budha park, isaneswar temple, defence colony, Utkal hospital, Niladri vihar basti, power grid square, Niladri vihar hanuman temple, kailash vihar, sai enclave, trident college, infocity square, cipet, kostav college, patia square.",
    stopsList: ["Master canteen Janpath", "sriya square", "ram mandir", "exhibition ground", "bhimabhoi school", "housing boards square", "rotary bhabwan", "nico park square", "anand bazar", "acharay vihar square", "immt", "jaydev vihar square", "pal height", "may fair road", "janta maidan", "xavier square", "fortune tower", "kaling hospital square", "rail sadan", "omfed square", "bda colony", "care hospital", "Lumbini vihar", "budha park", "isaneswar temple", "defence colony", "Utkal hospital", "Niladri vihar basti", "power grid square", "Niladri vihar hanuman temple", "kailash vihar", "sai enclave", "trident college", "infocity square", "cipet", "kostav college", "patia square"]
  },
  {
    route: "10",
    start: "Biju Patnaik Airport",
    destination: "bijupatnaik park",
    stops: "New airport square, capital hospital, ag sqare, Bhubaneswar club, nautala, power house square, sail office, sastri nagar sqare, the world, kaling stadium gate 2, ks gate 8, jayedev vihar square, pal heights, mayfair road, janta maidan, Xavior square, fortune tower, kaling hospital square, rail sadan, omfed square, Niladri vihar square, damana sq, cs pur police station, patia sq, cipet, infocity square, dlf, silicon, sikhar chandi, kimms hospital, kiit campus, kiit sq, sikhar chandi vihar, nandan vihar, manitribhuban, royal lagoon, Raghunathpur, Raghunathpur village, dauladei temple, nandan kannana high school, nandan Kannan, barang, barang ps, barang block, bachhipur, madhuban, mandakini resort, trisulia sq, kunheipara, judiciual academy, dagarpada road, satichaura sq, eye hospital sq, cda 6 park, cda 9 market sq, rajkishor marg, Saraswati sishu mandir, justice sq, state bank sq, bijupatnaik park",
    stopsList: ["New airport square", "capital hospital", "ag sqare", "Bhubaneswar club", "nautala", "power house square", "sail office", "sastri nagar sqare", "the world", "kaling stadium gate 2", "ks gate 8", "jayedev vihar square", "pal heights", "mayfair road", "janta maidan", "Xavior square", "fortune tower", "kaling hospital square", "rail sadan", "omfed square", "Niladri vihar square", "damana sq", "cs pur police station", "patia sq", "cipet", "infocity square", "dlf", "silicon", "sikhar chandi", "kimms hospital", "kiit campus", "kiit sq", "sikhar chandi vihar", "nandan vihar", "manitribhuban", "royal lagoon", "Raghunathpur", "Raghunathpur village", "dauladei temple", "nandan kannana high school", "nandan Kannan", "barang", "barang ps", "barang block", "bachhipur", "madhuban", "mandakini resort", "trisulia sq", "kunheipara", "judiciual academy", "dagarpada road", "satichaura sq", "eye hospital sq", "cda 6 park", "cda 9 market sq", "rajkishor marg", "Saraswati sishu mandir", "justice sq", "state bank sq", "bijupatnaik park"]
  },
  {
    route: "11",
    start: "Bhubaneswar Railway Station",
    destination: "Trisulia bus stand",
    stops: "Master canteen Janpath, sriya sq, ram mandir, satya nagar sq, satya nagar, maharshi college, Rupali square, rd women college, vani vihar, acharya vihar sq, Utkal university back gate, appolo hospital, sainik school, press square, osap 7 bettlaion, kaling hospital sq, rail sadan, omfed, niladrivihar square, damana square, salishree vihar phase 2, salishree vihar sq, s vihar jagannath temple, sai enclave, trident college, infocity square, dlf, silicon, sikhar chandi, kimms hospital, kiit campus, kiit sq, sikhar chandi vihar, nandan vihar, manitribhuban, royal lagoon, Raghunathpur, Raghunathpur village, dauladei temple, nandan kannana high school, nandan Kannan, barang, barang ps, barang block, bachhipur, madhuban, mandakini resort, trisulia sq",
    stopsList: ["Master canteen Janpath", "sriya sq", "ram mandir", "satya nagar sq", "satya nagar", "maharshi college", "Rupali square", "rd women college", "vani vihar", "acharya vihar sq", "Utkal university back gate", "appolo hospital", "sainik school", "press square", "osap 7 bettlaion", "kaling hospital sq", "rail sadan", "omfed", "niladrivihar square", "damana square", "salishree vihar phase 2", "salishree vihar sq", "s vihar jagannath temple", "sai enclave", "trident college", "infocity square", "dlf", "silicon", "sikhar chandi", "kimms hospital", "kiit campus", "kiit sq", "sikhar chandi vihar", "nandan vihar", "manitribhuban", "royal lagoon", "Raghunathpur", "Raghunathpur village", "dauladei temple", "nandan kannana high school", "nandan Kannan", "barang", "barang ps", "barang block", "bachhipur", "madhuban", "mandakini resort", "trisulia sq"]
  },
  {
    route: "12",
    start: "Bhubaneswar Railway Station",
    destination: "Nandankanan",
    stops: "Master canteen Janpath, sriya square, ram, exhibition ground, bhimabhoi school, housing boards square, AG colony, sastri nagar sqare, the world, kaling stadium gate 2, ks gate 8, jayedev vihar square, pal heights, mayfair road, janta maidan, Xavior square, fortune tower, kaling hospital square, rail sadan, omfed square, Niladri vihar square, damana sq, cs pur police station, patia sq, koel campus, Kannan vihar phase 2, kiit sq, sikhar chandi vihar, nandan vihar, manitribhuban, royal lagoon, Raghunathpur, Raghunathpur village, dauladei temple, nandan kannana high school, nandan Kannan",
    stopsList: ["Master canteen Janpath", "sriya square", "ram", "exhibition ground", "bhimabhoi school", "housing boards square", "AG colony", "sastri nagar sqare", "the world", "kaling stadium gate 2", "ks gate 8", "jayedev vihar square", "pal heights", "mayfair road", "janta maidan", "Xavior square", "fortune tower", "kaling hospital square", "rail sadan", "omfed square", "Niladri vihar square", "damana sq", "cs pur police station", "patia sq", "koel campus", "Kannan vihar phase 2", "kiit sq", "sikhar chandi vihar", "nandan vihar", "manitribhuban", "royal lagoon", "Raghunathpur", "Raghunathpur village", "dauladei temple", "nandan kannana high school", "nandan Kannan"]
  },
  {
    route: "13",
    start: "Lingipur",
    destination: "Nandankanana botanical garden",
    stops: "Master canteen Janpath, sriya sq, ram mandir, satya nagar sq, satya nagar, maharshi college, Rupali square, rd women college, vani vihar, acharya vihar sq, Utkal university back gate, appolo hospital, sainik school, press square, osap 7 bettlaion, kaling hospital sq, rail sadan, omfed, niladrivihar square, damana square, salishree vihar phase 2, salishree vihar sq, s vihar jagannath temple, sai enclave, trident college, infocity square, dlf, silicon, sikhar chandi, kimms hospital, kiit campus, kiit sq, sikhar chandi vihar, nandan vihar, manitribhuban, royal lagoon, Raghunathpur, Raghunathpur village, dauladei temple, nandan kannana high school, nandan Kannan",
    stopsList: ["Master canteen Janpath", "sriya sq", "ram mandir", "satya nagar sq", "satya nagar", "maharshi college", "Rupali square", "rd women college", "vani vihar", "acharya vihar sq", "Utkal university back gate", "appolo hospital", "sainik school", "press square", "osap 7 bettlaion", "kaling hospital sq", "rail sadan", "omfed", "niladrivihar square", "damana square", "salishree vihar phase 2", "salishree vihar sq", "s vihar jagannath temple", "sai enclave", "trident college", "infocity square", "dlf", "silicon", "sikhar chandi", "kimms hospital", "kiit campus", "kiit sq", "sikhar chandi vihar", "nandan vihar", "manitribhuban", "royal lagoon", "Raghunathpur", "Raghunathpur village", "dauladei temple", "nandan kannana high school", "nandan Kannan"]
  },
  {
    route: "14",
    start: "Kalinga Vihar",
    destination: "Bhubaneswar Railway Station",
    stops: "K4 ekamra residency, k4 sq, hanuman madir, tata ariyana, Ananda bana park, bipul garden, k7 kalayan mandap, igkc hospital, nuagaon sq, sum hospital, sum ultimate medicare, k8 dream palace, valia sq, cet college, naka gate, khandagiri bari, jayedev batika sq, jayedev vatika, amri hospital, satya sai enclave, Vinayaka enclave, bank of boroda colatia, jagannath temple colatia, collatia, khandagiri sq, khandagiri bypass, baramunda bsabt, Rajdhani college, fire station sq, Vivekananda hospital, delta sq, stabdi nagar, city women college, ouat sq, ouat clg, ganga nagar sq, unit 6, new airport sq, capital hospital, ag sq, unit 1 haat, raajmahal sq, ashok nagar, master canteen",
    stopsList: ["K4 ekamra residency", "k4 sq", "hanuman madir", "tata ariyana", "Ananda bana park", "bipul garden", "k7 kalayan mandap", "igkc hospital", "nuagaon sq", "sum hospital", "sum ultimate medicare", "k8 dream palace", "valia sq", "cet college", "naka gate", "khandagiri bari", "jayedev batika sq", "jayedev vatika", "amri hospital", "satya sai enclave", "Vinayaka enclave", "bank of boroda colatia", "jagannath temple colatia", "collatia", "khandagiri sq", "khandagiri bypass", "baramunda bsabt", "Rajdhani college", "fire station sq", "Vivekananda hospital", "delta sq", "stabdi nagar", "city women college", "ouat sq", "ouat clg", "ganga nagar sq", "unit 6", "new airport sq", "capital hospital", "ag sq", "unit 1 haat", "raajmahal sq", "ashok nagar", "master canteen"]
  },
  {
    route: "15",
    start: "Utkal hospital",
    destination: "cnbt",
    stops: "Niladri vihar basti, Power grid sq, Hanuman templeNiladri vihar, Shailashree vihar phase 6, Mangala mandir, Tarini temple, s vihar jagannath temple, sai enclave, trident college, infocity square, dlf, silicon, sikhar chandi, kimms hospital, kiit campus, kiit sq, sikhar chandi vihar, nandan vihar, manitribhuban, royal lagoon, Raghunathpur, Raghunathpur village, dauladei temple, nandan kannana high school, nandan Kannan, barang, barang ps, barang block, bachhipur, madhuban, trishulia sq, kunheipara, judicial academy, sishu bhawan, high court road, cuttack sai temple, puri ghaat, police station, city college",
    stopsList: ["Niladri vihar basti", "Power grid sq", "Hanuman templeNiladri vihar", "Shailashree vihar phase 6", "Mangala mandir", "Tarini temple", "s vihar jagannath temple", "sai enclave", "trident college", "infocity square", "dlf", "silicon", "sikhar chandi", "kimms hospital", "kiit campus", "kiit sq", "sikhar chandi vihar", "nandan vihar", "manitribhuban", "royal lagoon", "Raghunathpur", "Raghunathpur village", "dauladei temple", "nandan kannana high school", "nandan Kannan", "barang", "barang ps", "barang block", "bachhipur", "madhuban", "trishulia sq", "kunheipara", "judicial academy", "sishu bhawan", "high court road", "cuttack sai temple", "puri ghaat", "police station", "city college"]
  },
  {
    route: "16",
    start: "Bhubaneswar Railway Station",
    destination: "Sri Sri University, Cuttack",
    stops: "Master canteen Janpath, sriya sq, ram mandir, satya nagar sq, satya nagar, maharshi college, Rupali square, rd women college, vani vihar, satsang vihar, vss nagar road, rasulgarh sq, palasuni, satya sai temple, high tech hospital school, hanspal sq, puri canal road, high honda, assotech world, Bishnu vihar, Utkal height, mellenium city, pahal, apex college, sum hospital campur tour, nakhara sq, bamphakuta, ramnagar, telenga pentha, delta gada, Pratap nagari, bhanpur, balikuda, Gopalpur railway station, khapuria sq, link road, nishamani talkies, aurdoya market, pala mandam, badambadi busstand, badambadi sq, cnbt, city college, puri ghat policestation, cuttack sai temple, high court road, sishu bhawan judisial academy, dagarpada road, sati chaura sq, eye hospital sq, cda 6 park, cda 9 market sq, rajkishor marg, Saraswati mandir, justice sq, state bank sq, biju Patnaik park, state bank sq 1, justice sq, biren mitra park, cda sector 10, cd sector 11, Netaji shubash chak cuttack, cda sector 13, sector 13 block 1, sector 13 block 2, anapurna, cda sector 13 road 1, ravensha university Mahanadi campus, nluo, nluo hostel, police out post naraj, naraj barrage, inspection and certification centre",
    stopsList: ["Master canteen Janpath", "sriya sq", "ram mandir", "satya nagar sq", "satya nagar", "maharshi college", "Rupali square", "rd women college", "vani vihar", "satsang vihar", "vss nagar road", "rasulgarh sq", "palasuni", "satya sai temple", "high tech hospital school", "hanspal sq", "puri canal road", "high honda", "assotech world", "Bishnu vihar", "Utkal height", "mellenium city", "pahal", "apex college", "sum hospital campur tour", "nakhara sq", "bamphakuta", "ramnagar", "telenga pentha", "delta gada", "Pratap nagari", "bhanpur", "balikuda", "Gopalpur railway station", "khapuria sq", "link road", "nishamani talkies", "aurdoya market", "pala mandam", "badambadi busstand", "badambadi sq", "cnbt", "city college", "puri ghat policestation", "cuttack sai temple", "high court road", "sishu bhawan judisial academy", "dagarpada road", "sati chaura sq", "eye hospital sq", "cda 6 park", "cda 9 market sq", "rajkishor marg", "Saraswati mandir", "justice sq", "state bank sq", "biju Patnaik park", "state bank sq 1", "justice sq", "biren mitra park", "cda sector 10", "cd sector 11", "Netaji shubash chak cuttack", "cda sector 13", "sector 13 block 1", "sector 13 block 2", "anapurna", "cda sector 13 road 1", "ravensha university Mahanadi campus", "nluo", "nluo hostel", "police out post naraj", "naraj barrage", "inspection and certification centre"]
  },
  {
    route: "17",
    start: "Biju Patnaik International Airport",
    destination: "Barabati Stadium, Cuttack",
    stops: "New airport square, capital hospital, ag square, secretariat, Rabindra mandmp, keshri talikies, housing boards square, rotary bhabwan, nico park square, anand bazar, acharay vihar square, vani vihar, satsang vihar, vss nagar road, rasulgarh sq, palasuni, satya sai temple, high tech hospital school, hanspal sq, puri canal road, high honda, assotech world, Bishnu vihar, Utkal height, mellenium city, pahal, apex college, sum hospital campur tour, nakhara sq, bamphakuta, ramnagar, telenga pentha, delta gada, Pratap nagari, bhanpur, balikuda, Gopalpur railway station, khapuria sq, link road, nishamani talkies, aurdoya market, pala mandam, badambadi busstand, badambadi sq, cnbt, city college, puri ghat policestation, cuttack sai temple, high court road, sishu bhawan judisial academy, dagarpada road, sati chaura sq, krushak bazar, vidanashi, chahata nagar lane 4, chahata ghata, police signal training school, Srinivas gada, sifa hospital, deer park, baliyatra ground",
    stopsList: ["New airport square", "capital hospital", "ag square", "secretariat", "Rabindra mandmp", "keshri talikies", "housing boards square", "rotary bhabwan", "nico park square", "anand bazar", "acharay vihar square", "vani vihar", "satsang vihar", "vss nagar road", "rasulgarh sq", "palasuni", "satya sai temple", "high tech hospital school", "hanspal sq", "puri canal road", "high honda", "assotech world", "Bishnu vihar", "Utkal height", "mellenium city", "pahal", "apex college", "sum hospital campur tour", "nakhara sq", "bamphakuta", "ramnagar", "telenga pentha", "delta gada", "Pratap nagari", "bhanpur", "balikuda", "Gopalpur railway station", "khapuria sq", "link road", "nishamani talkies", "aurdoya market", "pala mandam", "badambadi busstand", "badambadi sq", "cnbt", "city college", "puri ghat policestation", "cuttack sai temple", "high court road", "sishu bhawan judisial academy", "dagarpada road", "sati chaura sq", "krushak bazar", "vidanashi", "chahata nagar lane 4", "chahata ghata", "police signal training school", "Srinivas gada", "sifa hospital", "deer park", "baliyatra ground"]
  },
  {
    route: "18",
    start: "Baramunda BSABT",
    destination: "Jagatpur",
    stops: "Rajdhani college, firestataion sq, gopabandhu nagar, crpf sq, nayapalii iskon temple, nabard, jayedev vihar square, pal heights, mayfair road, janta maidan, Xavior square, fortune tower, kaling hospital square, rail sadan, omfed square, Niladri vihar square, damana sq, cs pur police station, patia sq, cipet, infocity square, dlf, silicon, sikhar chandi, kimms hospital, kiit campus, kiit sq, sikhar chandi vihar, nandan vihar, manitribhuban, royal lagoon, Raghunathpur, Raghunathpur village, dauladei temple, nandan kannana high school, nandan Kannan, barang, barang ps, barang block, bachhipur, madhuban, mandakini resort, trisulia sq, kunheipara, judiciual academy, sishu bhawan, high court road, cuttack sai temple, puri ghaat, police station, city college, cnbt, badam badi sq, badam badi busstand, pala mandam, arundoya market, nishamani talking, linkroad, samrat cinema, omp sq, gandar pur, shikhar pur, jagatpur",
    stopsList: ["Rajdhani college", "firestataion sq", "gopabandhu nagar", "crpf sq", "nayapalii iskon temple", "nabard", "jayedev vihar square", "pal heights", "mayfair road", "janta maidan", "Xavior square", "fortune tower", "kaling hospital square", "rail sadan", "omfed square", "Niladri vihar square", "damana sq", "cs pur police station", "patia sq", "cipet", "infocity square", "dlf", "silicon", "sikhar chandi", "kimms hospital", "kiit campus", "kiit sq", "sikhar chandi vihar", "nandan vihar", "manitribhuban", "royal lagoon", "Raghunathpur", "Raghunathpur village", "dauladei temple", "nandan kannana high school", "nandan Kannan", "barang", "barang ps", "barang block", "bachhipur", "madhuban", "mandakini resort", "trisulia sq", "kunheipara", "judiciual academy", "sishu bhawan", "high court road", "cuttack sai temple", "puri ghaat", "police station", "city college", "cnbt", "badam badi sq", "badam badi busstand", "pala mandam", "arundoya market", "nishamani talking", "linkroad", "samrat cinema", "omp sq", "gandar pur", "shikhar pur", "jagatpur"]
  },
  {
    route: "19",
    start: "AIIMS",
    destination: "OMP Square–Mahanadi Vihar",
    stops: "Police academy, allu godam, patrapada1, allu godam 1, kids hospital road, aginia1, kolathia, khandagiri square khandagiri sq, khandagiri bypass, baramunda bsabt, Rajdhani college, fire station sq, gopabandhu nagar, crpf sq, nayapalii iskon temple, nabard, jayedev vihar flyover, immt, acharay vihar square, vani vihar, satsang vihar, vss nagar road, rasulgarh sq, palasuni, satya sai temple, high tech hospital school, hanspal sq, puri canal road, high honda, assotech world, Bishnu vihar, Utkal height, mellenium city, pahal, apex college, sum hospital campur tour, nakhara sq, bamphakuta, ramnagar, telenga pentha, delta gada, Pratap nagari, bhanpur, balikuda, Gopalpur railway station, khapuria sq, link road, samrat cinema, omp sq, gandar pur, shikhar pur, kaliaboda temple, haramani temple, kaliaboda sub postoffice",
    stopsList: ["Police academy", "allu godam", "patrapada1", "allu godam 1", "kids hospital road", "aginia1", "kolathia", "khandagiri square", "khandagiri bypass", "baramunda bsabt", "Rajdhani college", "fire station sq", "gopabandhu nagar", "crpf sq", "nayapalii iskon temple", "nabard", "jayedev vihar flyover", "immt", "acharay vihar square", "vani vihar", "satsang vihar", "vss nagar road", "rasulgarh sq", "palasuni", "satya sai temple", "high tech hospital school", "hanspal sq", "puri canal road", "high honda", "assotech world", "Bishnu vihar", "Utkal height", "mellenium city", "pahal", "apex college", "sum hospital campur tour", "nakhara sq", "bamphakuta", "ramnagar", "telenga pentha", "delta gada", "Pratap nagari", "bhanpur", "balikuda", "Gopalpur railway station", "khapuria sq", "link road", "samrat cinema", "omp sq", "gandar pur", "shikhar pur", "kaliaboda temple", "haramani temple", "kaliaboda sub postoffice"]
  },
  {
    route: "20",
    start: "Bhubaneswar Railway Station",
    destination: "Khordha New Bus Stand",
    stops: "Master canteen Janpath, sriya sq, ram mandir, satya nagar sq, satya nagar, maharshi college, Rupali square, rd women college, vani vihar, acharya vihar sq, immt, jaydev vihar sq, nabard, iskon temple, nayapalli, crpf sq, gopabandhu nagar, fire station, Rajdhani college, baramunda bsabt, khandagiri bypass, khandagiri sq, kolathia 1, aginia 1, allugodam, patrapada 1, k9, kalinga vihar sq, tamando, biji pur, Aditya hundai tamando, gohiriasq, retang sq, janla post office, janla medical, ogala pada, bhuasuni temple, jatani gate, ganga pada, ganga pada village, Jupiter college gangapada, zenth college, pitapallisq, pitapali petrol pump, khordha bypass sq, pn college, uphc, barunipeetha, gada khordha, drda, old collector office, palahaat sq",
    stopsList: ["Master canteen Janpath", "sriya sq", "ram mandir", "satya nagar sq", "satya nagar", "maharshi college", "Rupali square", "rd women college", "vani vihar", "acharya vihar sq", "immt", "jaydev vihar sq", "nabard", "iskon temple", "nayapalli", "crpf sq", "gopabandhu nagar", "fire station", "Rajdhani college", "baramunda bsabt", "khandagiri bypass", "khandagiri sq", "kolathia 1", "aginia 1", "allugodam", "patrapada 1", "k9", "kalinga vihar sq", "tamando", "biji pur", "Aditya hundai tamando", "gohiriasq", "retang sq", "janla post office", "janla medical", "ogala pada", "bhuasuni temple", "jatani gate", "ganga pada", "ganga pada village", "Jupiter college gangapada", "zenth college", "pitapallisq", "pitapali petrol pump", "khordha bypass sq", "pn college", "uphc", "barunipeetha", "gada khordha", "drda", "old collector office", "palahaat sq"]
  },
  {
    route: "21",
    start: "Bhubaneswar Railway Station",
    destination: "Khordha New Bus Stand",
    stops: "Master canteen, ashok nagar, raj mahal sq, unit 1 haat, ag sq, capital hospital, new airport sq, unit 6, ganga nagar sq, ouat college, ouat sq, city women college, stabdi nagar, delta sq, vivekanada hospital, fire station sq, fire station, Rajdhani college, baramunda bsabt, khandagiri bypass, khandagiri sq, kolathia 1, aginia 1, allugodam, patrapada 1, k9, kalinga vihar sq, tamando, biji pur, gohiriasq, retang sq, janla post office, janla medical, ogala pada, bhuasuni temple, jatani gate, ganga pada, ganga pada village, Jupiter college gangapada, zenth college, pitapallisq, pitapali petrol pump, khordha bypass sq, pn college, Mukund prashad sq, old fire station sq, khorda police station, bank sq, khordha bazar",
    stopsList: ["Master canteen", "ashok nagar", "raj mahal sq", "unit 1 haat", "ag sq", "capital hospital", "new airport sq", "unit 6", "ganga nagar sq", "ouat college", "ouat sq", "city women college", "stabdi nagar", "delta sq", "vivekanada hospital", "fire station sq", "fire station", "Rajdhani college", "baramunda bsabt", "khandagiri bypass", "khandagiri sq", "kolathia 1", "aginia 1", "allugodam", "patrapada 1", "k9", "kalinga vihar sq", "tamando", "biji pur", "gohiriasq", "retang sq", "janla post office", "janla medical", "ogala pada", "bhuasuni temple", "jatani gate", "ganga pada", "ganga pada village", "Jupiter college gangapada", "zenth college", "pitapallisq", "pitapali petrol pump", "khordha bypass sq", "pn college", "Mukund prashad sq", "old fire station sq", "khorda police station", "bank sq", "khordha bazar"]
  },
  {
    route: "22A",
    start: "Bhubaneswar Railway Station",
    destination: "Khordha Road Station",
    stops: "Master canteen, ashok nagar, raj mahal square, bapuji nagar, sishubhawan sq, forest part, old airport square, nabin nivas, palash palli, punama flyover, bhimatangi, ekamra college, lingaraj station, sundar pada square, Trilochan vihar, gauri dham, botanda, chandi bazar, kantilok, kuha, ketraphala, biribandaha, shuvhashree tower, shrusti mansion, Pradhan sahi, Aryan college, jamukuli, bahali pada, oec, xub, nirajanpur sq, budha pada, harirajput sq, patrasahi harirazpur, babasomnath sq, kutiari highscool, nilakanthe swar square, sayed memorial hospital",
    stopsList: ["Master canteen", "ashok nagar", "raj mahal square", "bapuji nagar", "sishubhawan sq", "forest part", "old airport square", "nabin nivas", "palash palli", "punama flyover", "bhimatangi", "ekamra college", "lingaraj station", "sundar pada square", "Trilochan vihar", "gauri dham", "botanda", "chandi bazar", "kantilok", "kuha", "ketraphala", "biribandaha", "shuvhashree tower", "shrusti mansion", "Pradhan sahi", "Aryan college", "jamukuli", "bahali pada", "oec", "xub", "nirajanpur sq", "budha pada", "harirajput sq", "patrasahi harirazpur", "babasomnath sq", "kutiari highscool", "nilakanthe swar square", "sayed memorial hospital"]
  },
  {
    route: "22B",
    start: "Jatani Gate",
    destination: "Khordha New Bus Stand",
    stops: "Gobinda pur, royal habitate, konar institute of science and technology, sandha pur, centurian university of technology and management, jatani college, pranath government high school, community heathcentre jatani, sofitorium, harivaina sq1, jatani municipal council 1, mahul gudiasq 1, jatani policestation 1, sitaram chowk, khordha road station, sitaram chowk1, jatani police station 1, mahul gudial square 1, jatani municipal council 1, harivaina sq 1, badanuagaon, block sq, iit road, niser, padam pur, metro apartment, bsf betalium camp, carmel English medium school, chachera, khordabypass sq, pncollege, Mukund prasand sq, old fire station, khorda police station, bank sq, khordha bazar",
    stopsList: ["Gobinda pur", "royal habitate", "konar institute of science and technology", "sandha pur", "centurian university of technology and management", "jatani college", "pranath government high school", "community heathcentre jatani", "sofitorium", "harivaina sq1", "jatani municipal council 1", "mahul gudiasq 1", "jatani policestation 1", "sitaram chowk", "khordha road station", "sitaram chowk1", "jatani police station 1", "mahul gudial square 1", "jatani municipal council 1", "harivaina sq 1", "badanuagaon", "block sq", "iit road", "niser", "padam pur", "metro apartment", "bsf betalium camp", "carmel English medium school", "chachera", "khordabypass sq", "pncollege", "Mukund prasand sq", "old fire station", "khorda police station", "bank sq", "khordha bazar"]
  },
  {
    route: "23",
    start: "Bhubaneswar Railway Station",
    destination: "Igkc Hospital",
    stops: "Master canteen, ashok nagar, raj mahal sq, unit 1 haat, ag sq, Bhubaneswar club, governor house sq, surya nagar, gopabandhu sq, siripur market, ouat sq, ouat college, ouat sq, city women college, stabdi nagar, delta sq, vivekanada hospital, fire station sq, fire station, crpf kb, rental colony, jagannath vihar, agriculture directorate, kaling studio sq, ayurveda college, shyampur, sum hospital",
    stopsList: ["Master canteen", "ashok nagar", "raj mahal sq", "unit 1 haat", "ag sq", "Bhubaneswar club", "governor house sq", "surya nagar", "gopabandhu sq", "siripur market", "ouat sq", "ouat college", "ouat sq", "city women college", "stabdi nagar", "delta sq", "vivekanada hospital", "fire station sq", "fire station", "crpf kb", "rental colony", "jagannath vihar", "agriculture directorate", "kaling studio sq", "ayurveda college", "shyampur", "sum hospital"]
  },
  {
    route: "24",
    start: "Kalinga Vihar",
    destination: "Sai Temple",
    stops: "Hanuman mandir, saind arnolds school k4, kaling vihar k5, kaling vihar sq, k9, patrapada 1, allugodam 1, kids hospital, aginia 1, kolathia, khandagiri sq, khandagiri bypass, baramunda bsabt, Rajdhani college, fire station sq, gopabandhu nagar, crpf sq, nayapalii iskon temple, nabard, jayedev vihar flyover, immt, acharay vihar square, vani vihar, satsang vihar, vss nagar road, rasulgarh sq, bomikhal, ekamra talikies, jharapada, yatri nivas, laxmi sagar sq, old station bazar or railway station, sabarshai lane, Kalpana sq, state museum, bjb college, ncc canteen, shree hospital, ravi takies, rajarani temple, chili pokhari, Ratnakar bhag, brahmeswar patna, megheswar temple",
    stopsList: ["Hanuman mandir", "saind arnolds school k4", "kaling vihar k5", "kaling vihar sq", "k9", "patrapada 1", "allugodam 1", "kids hospital", "aginia 1", "kolathia", "khandagiri sq", "khandagiri bypass", "baramunda bsabt", "Rajdhani college", "fire station sq", "gopabandhu nagar", "crpf sq", "nayapalii iskon temple", "nabard", "jayedev vihar flyover", "immt", "acharay vihar square", "vani vihar", "satsang vihar", "vss nagar road", "rasulgarh sq", "bomikhal", "ekamra talikies", "jharapada", "yatri nivas", "laxmi sagar sq", "old station bazar or railway station", "sabarshai lane", "Kalpana sq", "state museum", "bjb college", "ncc canteen", "shree hospital", "ravi takies", "rajarani temple", "chili pokhari", "Ratnakar bhag", "brahmeswar patna", "megheswar temple"]
  },
  {
    route: "24E",
    start: "Kalinga Vihar",
    destination: "Bainchua",
    stops: "Hanuman mandir, saind arnolds school k4, kaling vihar k5, kaling vihar sq, k9, patrapada 1, allugodam 1, kids hospital, aginia 1, kolathia, khandagiri sq, khandagiri bypass, baramunda bsabt, Rajdhani college, fire station sq, gopabandhu nagar, crpf sq, nayapalii iskon temple, nabard, jayedev vihar flyover, immt, acharay vihar square, vani vihar, satsang vihar, vss nagar road, rasulgarh sq, bomikhal, ekamra talikies, jharapada, yatri nivas, laxmi sagar sq, old station bazar or railway station, sabarshai lane, Kalpana sq, state museum, bjb college, ncc canteen, shree hospital, ravi takies, rajarani temple, chili pokhari, Ratnakar bhag, brahmeswar patna, megheswar temple, sai mandir, sai residency, Tarini mandir, ranagabazar",
    stopsList: ["Hanuman mandir", "saind arnolds school k4", "kaling vihar k5", "kaling vihar sq", "k9", "patrapada 1", "allugodam 1", "kids hospital", "aginia 1", "kolathia", "khandagiri sq", "khandagiri bypass", "baramunda bsabt", "Rajdhani college", "fire station sq", "gopabandhu nagar", "crpf sq", "nayapalii iskon temple", "nabard", "jayedev vihar flyover", "immt", "acharay vihar square", "vani vihar", "satsang vihar", "vss nagar road", "rasulgarh sq", "bomikhal", "ekamra talikies", "jharapada", "yatri nivas", "laxmi sagar sq", "old station bazar or railway station", "sabarshai lane", "Kalpana sq", "state museum", "bjb college", "ncc canteen", "shree hospital", "ravi takies", "rajarani temple", "chili pokhari", "Ratnakar bhag", "brahmeswar patna", "megheswar temple", "sai mandir", "sai residency", "Tarini mandir", "ranagabazar"]
  },
  {
    route: "25",
    start: "gadakana",
    destination: "Ranasingpur",
    stops: "Gadakana village, dhpl sahoo residency, ranganath mandir, Harpriya enclave, rangamatia uparasahi, macheswar station, dhirikuhi shai, dl colony, vss nagar market, vss nagar, pnt colony, vss nagar road, rasulgarh sq, satasang vihar, vani vihar, rd women college Rupali sq, maharshi college sq, satya nagar, satynagar sq, ram mandir, sriya sq, mastar canteen sq, Bhubaneswar railway station, master canteen, ashok nagar, ashok nagar, raj mahal square, bapuji nagar, sishubhawan sq, forest part, old airport square, nabin nivas, palash palli, punama flyover, bhimatangi, ekamra college, lingaraj station, sundar pada hata, pokhariput, housing board colony, madhushudan park, kalabumi, gandamunda, iter college, jagamara, jaganath temple, khandagiri sq, kolathia 1, aginia 1, kids hospital road, kids hospital, dhumdhuma, raghunath nagar",
    stopsList: ["Gadakana village", "dhpl sahoo residency", "ranganath mandir", "Harpriya enclave", "rangamatia uparasahi", "macheswar station", "dhirikuhi shai", "dl colony", "vss nagar market", "vss nagar", "pnt colony", "vss nagar road", "rasulgarh sq", "satasang vihar", "vani vihar", "rd women college Rupali sq", "maharshi college sq", "satya nagar", "satynagar sq", "ram mandir", "sriya sq", "mastar canteen sq", "Bhubaneswar railway station", "master canteen", "ashok nagar", "ashok nagar", "raj mahal square", "bapuji nagar", "sishubhawan sq", "forest part", "old airport square", "nabin nivas", "palash palli", "punama flyover", "bhimatangi", "ekamra college", "lingaraj station", "sundar pada hata", "pokhariput", "housing board colony", "madhushudan park", "kalabumi", "gandamunda", "iter college", "jagamara", "jaganath temple", "khandagiri sq", "kolathia 1", "aginia 1", "kids hospital road", "kids hospital", "dhumdhuma", "raghunath nagar"]
  },
  {
    route: "26",
    start: "Dumduma (Jadupur)",
    destination: "Rokat, Rajdhani Engineering College",
    stops: "Dumduma hosing board colony, dumduma, kids hospital, dumduma phase 3, dumduma phase 4, dumduma sq, dumduma phase 5, arya village, cosmo polis, aginia 1, allugodam, patrapada 1, allugodam 1, aginia 1, kolaathia, khandagiri sq, jagannath temple, jagamara, malick complex, krishna garden, dharma vihar road, baramunda shiv temple, sobhagya nagar phase, sobhagya nagar, krushi vihar sq, city women college, ouat sq, ouat clg, ganga nagar sq, unit 6, new airport sq, capital hospital, ag sq, unit 1 haat, raajmahal sq, ashok nagar, master canteen Janpath, sriya sq, ram mandir, satya nagar sq, satya nagar, maharshi college, Rupali square, rd women college, vani vihar, satsang vihar, vss nagar road, rasulgarh sq, mancheswar police station, sbi chaowk, idco tower, cime college, mancheswar railway station road, chakeisheni, arss, vss nagar market, mancheswar station back gate, bhota pada sq, signature arcade bhota pada, omm vihar",
    stopsList: ["Dumduma hosing board colony", "dumduma", "kids hospital", "dumduma phase 3", "dumduma phase 4", "dumduma sq", "dumduma phase 5", "arya village", "cosmo polis", "aginia 1", "allugodam", "patrapada 1", "allugodam 1", "aginia 1", "kolaathia", "khandagiri sq", "jagannath temple", "jagamara", "malick complex", "krishna garden", "dharma vihar road", "baramunda shiv temple", "sobhagya nagar phase", "sobhagya nagar", "krushi vihar sq", "city women college", "ouat sq", "ouat clg", "ganga nagar sq", "unit 6", "new airport sq", "capital hospital", "ag sq", "unit 1 haat", "raajmahal sq", "ashok nagar", "master canteen Janpath", "sriya sq", "ram mandir", "satya nagar sq", "satya nagar", "maharshi college", "Rupali square", "rd women college", "vani vihar", "satsang vihar", "vss nagar road", "rasulgarh sq", "mancheswar police station", "sbi chaowk", "idco tower", "cime college", "mancheswar railway station road", "chakeisheni", "arss", "vss nagar market", "mancheswar station back gate", "bhota pada sq", "signature arcade bhota pada", "omm vihar"]
  },
  {
    route: "27",
    start: "Bhubaneswar Railway Station",
    destination: "Bhagwanpur",
    stops: "Master canteen, ashok nagar, raj mahal sq, unit 1 haat, ag sq, Bhubaneswar club, governor house sq, power house sq, kalayani market, unit 8 colony, ouat guest house, cbi office, jaleswar temple, delta sq, vivekanada hospital, fire station sq, fire station, Rajdhani college, baramunda bsabt, khandagiri bypass, khandagiri sq, kolathia 1, aginia 1, kids hospital road, allugodam 1, police academy, aiims, panchayat office ransingha pur, sijua village road, oro palace, santhoshi mandir",
    stopsList: ["Master canteen", "ashok nagar", "raj mahal sq", "unit 1 haat", "ag sq", "Bhubaneswar club", "governor house sq", "power house sq", "kalayani market", "unit 8 colony", "ouat guest house", "cbi office", "jaleswar temple", "delta sq", "vivekanada hospital", "fire station sq", "fire station", "Rajdhani college", "baramunda bsabt", "khandagiri bypass", "khandagiri sq", "kolathia 1", "aginia 1", "kids hospital road", "allugodam 1", "police academy", "aiims", "panchayat office ransingha pur", "sijua village road", "oro palace", "santhoshi mandir"]
  },
  {
    route: "28",
    start: "Bhubaneswar Railway Station",
    destination: "Kalinga Nagar (Trident)",
    stops: "Master canteen, ashok nagar, raj mahal sq, unit 1 haat, ag sq, nautala, power house sq, kalayani market, unit 8 sq, passport office, cpwt office, crpf sq, crpf sq, gopabandhu nagar, fire station, Rajdhani college, baramunda bsabt, khandagiri bypass, khandagiri sq, kolathia1, jagannath temple, kolathia, bank of boroda kolathia, Vinayaka enclave, satya sahi enclave, amri hospital, jaydev batika, jayedev vatia sq, khandagiri bari, naka gate, ceet college, walia sq, ghatikia, k7 kalyan mandap, kaling nagar, paikara pur, paikara housing colony",
    stopsList: ["Master canteen", "ashok nagar", "raj mahal sq", "unit 1 haat", "ag sq", "nautala", "power house sq", "kalayani market", "unit 8 sq", "passport office", "cpwt office", "crpf sq", "crpf sq", "gopabandhu nagar", "fire station", "Rajdhani college", "baramunda bsabt", "khandagiri bypass", "khandagiri sq", "kolathia1", "jagannath temple", "kolathia", "bank of boroda kolathia", "Vinayaka enclave", "satya sahi enclave", "amri hospital", "jaydev batika", "jayedev vatia sq", "khandagiri bari", "naka gate", "ceet college", "walia sq", "ghatikia", "k7 kalyan mandap", "kaling nagar", "paikara pur", "paikara housing colony"]
  },
  {
    route: "29",
    start: "Bhagwanpur",
    destination: "Sai Mandir",
    stops: "Kishor club Bhagwan pur, balunkeswar temple, rammandir Bhagwan pur, k9 b, pal bhawan road, k9 lane 4, kaling vihar sq, patrapada 1, allugodam 1, kids hospital, aginia 1, kolathia, khandagiri sq, khandagiri bypass, baramunda bsabt, Rajdhani college, fire station sq, gopabandhu nagar, crpf sq, nayapalii iskon temple, nabard, jayedev vihar flyover, immt, acharay vihar square, vani vihar, satsang vihar, vss nagar road, rasulgarh sq, bomikhal, ekamra talikies, jharapada, yatri nivas, laxmi sagar sq, old station bazar or railway station, sabarshai lane, Ri office, bjem school, Vishwanath nagar, badagad haat, badagada highschool, bagada police station, panchupanda cave, bda park, badagada brit colony, megheswar temple",
    stopsList: ["Kishor club Bhagwan pur", "balunkeswar temple", "rammandir Bhagwan pur", "k9 b", "pal bhawan road", "k9 lane 4", "kaling vihar sq", "patrapada 1", "allugodam 1", "kids hospital", "aginia 1", "kolathia", "khandagiri sq", "khandagiri bypass", "baramunda bsabt", "Rajdhani college", "fire station sq", "gopabandhu nagar", "crpf sq", "nayapalii iskon temple", "nabard", "jayedev vihar flyover", "immt", "acharay vihar square", "vani vihar", "satsang vihar", "vss nagar road", "rasulgarh sq", "bomikhal", "ekamra talikies", "jharapada", "yatri nivas", "laxmi sagar sq", "old station bazar or railway station", "sabarshai lane", "Ri office", "bjem school", "Vishwanath nagar", "badagad haat", "badagada highschool", "bagada police station", "panchupanda cave", "bda park", "badagada brit colony", "megheswar temple"]
  },
  {
    route: "29E",
    start: "Bhagwanpur",
    destination: "SBI Colony",
    stops: "Kishor club Bhagwan pur, balunkeswar temple, rammandir Bhagwan pur, k9 b, pal bhawan road, k9 lane 4, kaling vihar sq, patrapada 1, allugodam 1, kids hospital, aginia 1, kolathia, khandagiri sq, khandagiri bypass, baramunda bsabt, Rajdhani college, fire station sq, gopabandhu nagar, crpf sq, nayapalii iskon temple, nabard, jayedev vihar flyover, immt, acharay vihar square, vani vihar, satsang vihar, vss nagar road, rasulgarh sq, bomikhal, ekamra talikies, jharapada, yatri nivas, laxmi sagar sq, old station bazar or railway station, sabarshai lane, Ri office, bjem school, Vishwanath nagar, badagad haat, badagada highschool, bagada police station, panchupanda cave, bda park, badagada brit colony, megheswar temple, sai mandir, sr vally, mangraj point, jena market, korandaknata sq",
    stopsList: ["Kishor club Bhagwan pur", "balunkeswar temple", "rammandir Bhagwan pur", "k9 b", "pal bhawan road", "k9 lane 4", "kaling vihar sq", "patrapada 1", "allugodam 1", "kids hospital", "aginia 1", "kolathia", "khandagiri sq", "khandagiri bypass", "baramunda bsabt", "Rajdhani college", "fire station sq", "gopabandhu nagar", "crpf sq", "nayapalii iskon temple", "nabard", "jayedev vihar flyover", "immt", "acharay vihar square", "vani vihar", "satsang vihar", "vss nagar road", "rasulgarh sq", "bomikhal", "ekamra talikies", "jharapada", "yatri nivas", "laxmi sagar sq", "old station bazar or railway station", "sabarshai lane", "Ri office", "bjem school", "Vishwanath nagar", "badagad haat", "badagada highschool", "bagada police station", "panchupanda cave", "bda park", "badagada brit colony", "megheswar temple", "sai mandir", "sr vally", "mangraj point", "jena market", "korandaknata sq"]
  },
  {
    route: "30",
    start: "Bhubaneswar Railway Station",
    destination: "mahatam Gandhi achademy of prisons",
    stops: "Master canteen, ashok nagar, raj mahal sq, unit 1 haat, ag sq, Bhubaneswar club, governor house sq, surya nagar, gopabandhu sq, siripur market, ouat sq, ouat college, ouat sq, city women college, stabdi nagar, delta sq, vivekanada hospital, fire station sq, fire station, crpf kb, rental colony, jagannath vihar, agriculture directorate, kaling studio sq, ayurveda college, shyampur, sum hospital, nuagaon sq, malipada, ri paikara pur, gothapatana sq, iiit sq, nalco research centre, iiit Bhubaneswar, stpi sq, iit sq, paikara pur road, roti, Tarini temple ghangapatana, ghangapatan sw, ablaze homz, kateni, kantabada bazar, sparse hosptiana, kanatabada bazar, kateni, kateni village, adurta sishu sadan, giringa put, optcl grid sub station, community health, centre, mendhasal, biju Patnaik open aur ashram, chatabar, wild lotours textile mill",
    stopsList: ["Master canteen", "ashok nagar", "raj mahal sq", "unit 1 haat", "ag sq", "Bhubaneswar club", "governor house sq", "surya nagar", "gopabandhu sq", "siripur market", "ouat sq", "ouat college", "ouat sq", "city women college", "stabdi nagar", "delta sq", "vivekanada hospital", "fire station sq", "fire station", "crpf kb", "rental colony", "jagannath vihar", "agriculture directorate", "kaling studio sq", "ayurveda college", "shyampur", "sum hospital", "nuagaon sq", "malipada", "ri paikara pur", "gothapatana sq", "iiit sq", "nalco research centre", "iiit Bhubaneswar", "stpi sq", "iit sq", "paikara pur road", "roti", "Tarini temple ghangapatana", "ghangapatan sw", "ablaze homz", "kateni", "kantabada bazar", "sparse hosptiana", "kanatabada bazar", "kateni", "kateni village", "adurta sishu sadan", "giringa put", "optcl grid sub station", "community health", "centre", "mendhasal", "biju Patnaik open aur ashram", "chatabar", "wild lotours textile mill"]
  },
  {
    route: "31",
    start: "Bhubaneswar Railway Station",
    destination: "Hi-Tech Hospital",
    stops: "Master canteen Janpath, sriya square, ram mandir, odisha blind association, toshali bhawan, yatri nivas, laxmi sagar sq, laxmi sagr, laxmi sagar policestation, jail sq, ganesh mandap, shanti nagar, jagannath nagar lane 3, jagannath nagar lane5, jagannath nagar lane7, jagannath nagar lane11, moder school, ggp colony road, pandra, pandra market",
    stopsList: ["Master canteen Janpath", "sriya square", "ram mandir", "odisha blind association", "toshali bhawan", "yatri nivas", "laxmi sagar sq", "laxmi sagr", "laxmi sagar policestation", "jail sq", "ganesh mandap", "shanti nagar", "jagannath nagar lane 3", "jagannath nagar lane5", "jagannath nagar lane7", "jagannath nagar lane11", "moder school", "ggp colony road", "pandra", "pandra market"]
  },
  {
    route: "32",
    start: "Baramunda BSABT",
    destination: "Lingaraj Temple",
    stops: "Rajdhani college, firestataion sq, gopabandhu nagar, crpf sq, nayapalii iskon temple, nabard, jayedev vihar flyover, immt, acharay vihar square, vani vihar, rd women college Rupali sq, maharshi college sq, satya nagar, satynagar sq, ram mandir, sriya sq, mastar canteen sq, Bhubaneswar railway station, master canteen, ashok nagar, ashok nagar, raj mahal square, Kalpana sq, state museum, bjb college, ncc canteen, shree hospital, ravi takies, kedar gauri temple, gauri nagar, garaj chowk, Mahaveer chowk, Samantaraypur, Sriram nagar sq, kedar lane",
    stopsList: ["Rajdhani college", "firestataion sq", "gopabandhu nagar", "crpf sq", "nayapalii iskon temple", "nabard", "jayedev vihar flyover", "immt", "acharay vihar square", "vani vihar", "rd women college Rupali sq", "maharshi college sq", "satya nagar", "satynagar sq", "ram mandir", "sriya sq", "mastar canteen sq", "Bhubaneswar railway station", "master canteen", "ashok nagar", "ashok nagar", "raj mahal square", "Kalpana sq", "state museum", "bjb college", "ncc canteen", "shree hospital", "ravi takies", "kedar gauri temple", "gauri nagar", "garaj chowk", "Mahaveer chowk", "Samantaraypur", "Sriram nagar sq", "kedar lane"]
  },
  {
    route: "33",
    start: "Bhubaneswar Railway Station",
    destination: "danda mukndapur bypass",
    stops: "Master canteen, ashok nagar, raj mahal sq, Kalpana sq, state museum, bjb college, ncc canteen, shree hospital, ravi takies, kedar gauri temple, gauri nagar, garaj chowk, Mahaveer chowk, Samantaraypur, ganguabridge, nuagaon, gongotri nagar road 3, sishupal ghara, lingipur, shree shree borda hospital, Natha pur, dhauli sq, bali shahi, Uttara sq, cifa, kec college, gudia pokhari sq, hightech heaven, siula, loards sway apartment, Gobardhan pur, jhikiniri mal, Jayesh patina chawk, pipili bypass, pipili nimapada chawk, pipili police station, pipli market, pipili hospital, pipli court, danda mukndapur",
    stopsList: ["Master canteen", "ashok nagar", "raj mahal sq", "Kalpana sq", "state museum", "bjb college", "ncc canteen", "shree hospital", "ravi takies", "kedar gauri temple", "gauri nagar", "garaj chowk", "Mahaveer chowk", "Samantaraypur", "ganguabridge", "nuagaon", "gongotri nagar road 3", "sishupal ghara", "lingipur", "shree shree borda hospital", "Natha pur", "dhauli sq", "bali shahi", "Uttara sq", "cifa", "kec college", "gudia pokhari sq", "hightech heaven", "siula", "loards sway apartment", "Gobardhan pur", "jhikiniri mal", "Jayesh patina chawk", "pipili bypass", "pipili nimapada chawk", "pipili police station", "pipli market", "pipili hospital", "pipli court", "danda mukndapur"]
  },
  {
    route: "34",
    start: "Bhubaneswar Railway Station",
    destination: "Balakati (Sai Hospital)",
    stops: "Master canteen, ashok nagar, raj mahal sq, kalpana sq, state museum, bjb college, ncc canteem shre hospital, ravi talkies, kedar goru temple, gouri nagar, garage chaak, Mahavir chowk, samantara pur, gagua bridge, nuagaon, Gangotri nagar, road, 3, sishupalgarh, lingipur, srisri borda hospital, nathpur, dhauli sq, balishai Uttara sq, balakati, balakati post office, dulladei temple",
    stopsList: ["Master canteen", "ashok nagar", "raj mahal sq", "kalpana sq", "state museum", "bjb college", "ncc canteem shre hospital", "ravi talkies", "kedar goru temple", "gouri nagar", "garage chaak", "Mahavir chowk", "samantara pur", "gagua bridge", "nuagaon", "Gangotri nagar", "road, 3", "sishupalgarh", "lingipur", "srisri borda hospital", "nathpur", "dhauli sq", "balishai Uttara sq", "balakati", "balakati post office", "dulladei temple"]
  },
  {
    route: "35",
    start: "Bhubaneswar Railway Station",
    destination: "Udayanath college",
    stops: "Master canteen, ashok nagar, raj mahal sq, kalpana sq, sabrsahi lane, old station bazaar or railway station, laxmi sagar sq, yatri nivas, jharpada, ekamar talkies, bomikhal, rasulgarh market, rasulgarh sq, palasuni, saptasati temple, hightech hospital sq, hanspal sqr, haspala, jaogamaya market, balianata bazar, andilo, siphon chowk, talagada, jawaharial nehru Mahavidyalaya, benupur, balikanthia, ramachandrapur, singadapur, brahaman sahi, jitikara suala, sonhalia rice mill, paribasudeipur, nursinghatempel, betenda, kula shai prtaprudrapur grama panchayat, prataprudrapur, apata sahi, upara sahi, jayedvpeeth or kendubilwa, phiriphira, barahipur, adaspur bus stand, adaspur hospital",
    stopsList: ["Master canteen", "ashok nagar", "raj mahal sq", "kalpana sq", "sabrsahi lane", "old station bazaar or railway station", "laxmi sagar sq", "yatri nivas", "jharpada", "ekamar talkies", "bomikhal", "rasulgarh market", "rasulgarh sq", "palasuni", "saptasati temple", "hightech hospital sq", "hanspal sqr", "haspala", "jaogamaya market", "balianata bazar", "andilo", "siphon chowk", "talagada", "jawaharial nehru Mahavidyalaya", "benupur", "balikanthia", "ramachandrapur", "singadapur", "brahaman sahi", "jitikara suala", "sonhalia rice mill", "paribasudeipur", "nursinghatempel", "betenda", "kula shai prtaprudrapur grama panchayat", "prataprudrapur", "apata sahi", "upara sahi", "jayedvpeeth or kendubilwa", "phiriphira", "barahipur", "adaspur bus stand", "adaspur hospital"]
  },
  {
    route: "36",
    start: "Bhubaneswar Railway Station",
    destination: "Mundali",
    stops: "Master canteen Janpath, sriya sq, ram mandir, satya nagar sq, satya nagar, maharshi college, Rupali square, rd women college, vani vihar, acharya vihar sq, immt, jaydev vihar square, pal height, may fair road, janta maidan, xavier square, fortune tower, kaling hospital square, rail sadan, omfed squareniladri vihar sq, damana sq, chandrashkhara pur police station, patia square, koel campus, kanan vihar phase 2, kiit square, sikharchandi vihar, nadan vihar, mani Tribhuvan, royal lagoon, Raghunathpur, Raghunathpur village, dauladei temple, nandan kannana high school, nandan Kannan, barang, barang ps, barang block, bachhipur, madhuban, kunheipara, judicial academy sq, abit, cda sector 6 road, markatanagar cda 7, abhinab bidanasi sub post office, cda sector 9 road, riverine hospital, cda sector 10, cda sector 11, Netaji subhash chahak cuttak, cda sector 13, nluo naraj barrage, naraj railway station road, naraj gp, peracock valley, cpdo, talagarh, sana mundali, mundali barrage",
    stopsList: ["Master canteen Janpath", "sriya sq", "ram mandir", "satya nagar sq", "satya nagar", "maharshi college", "Rupali square", "rd women college", "vani vihar", "acharya vihar sq", "immt", "jaydev vihar square", "pal height", "may fair road", "janta maidan", "xavier square", "fortune tower", "kaling hospital square", "rail sadan", "omfed squareniladri vihar sq", "damana sq", "chandrashkhara pur police station", "patia square", "koel campus", "kanan vihar phase 2", "kiit square", "sikharchandi vihar", "nadan vihar", "mani Tribhuvan", "royal lagoon", "Raghunathpur", "Raghunathpur village", "dauladei temple", "nandan kannana high school", "nandan Kannan", "barang", "barang ps", "barang block", "bachhipur", "madhuban", "kunheipara", "judicial academy sq", "abit", "cda sector 6 road", "markatanagar cda 7", "abhinab bidanasi sub post office", "cda sector 9 road", "riverine hospital", "cda sector 10", "cda sector 11", "Netaji subhash chahak cuttak", "cda sector 13", "nluo naraj barrage", "naraj railway station road", "naraj gp", "peracock valley", "cpdo", "talagarh", "sana mundali", "mundali barrage"]
  },
  {
    route: "37",
    start: "Baramunda BSABT",
    destination: "Naraj marthapur Railway",
    stops: "baramndua bsbat, rajdhani college, fire station sq, gopabandhu nagar, crpf sq, nayapali, iskon temple, nabad, jaydev vihar sq, palheights, mayfair road, janta maidan, xavier sq, fortune tower, kalinga hospital sq, rail sadan, omfed sq, niladri vihar sq, patia sq, koel campus, kanak vihar phase 2, kiit sq, shikharxhandi vuhar, nandan vuhar, mani tribuvan, royal lagoon, raghunathpur, raghnathpur village, Raghunathpur, Raghunathpur village, dauladei temple, nandan kannana high school, nandan Kannan, barang, barang ps, barang block, bachhipur, madhuban, trisulia sq, mundamuhan sq, fakirpada, presidency resort, patapur, padmalava nagar, hanuman temple, sandhapur, vidayadhar pur, sandhapur, sandhapur hwc, srisri university gate 1, ommfeed dairy, inspection and certification centre, naraj barrage, Naraj Railway Station, marthapur",
    stopsList: ["baramndua bsbat", "rajdhani college", "fire station sq", "gopabandhu nagar", "crpf sq", "nayapali", "iskon temple", "nabad", "jaydev vihar sq", "palheights", "mayfair road", "janta maidan", "xavier sq", "fortune tower", "kalinga hospital sq", "rail sadan", "omfed sq", "niladri vihar sq", "patia sq", "koel campus", "kanak vihar phase 2", "kiit sq", "shikharxhandi vuhar", "nandan vuhar", "mani tribuvan", "royal lagoon", "raghunathpur", "raghnathpur village", "Raghunathpur", "Raghunathpur village", "dauladei temple", "nandan kannana high school", "nandan Kannan", "barang", "barang ps", "barang block", "bachhipur", "madhuban", "trisulia sq", "mundamuhan sq", "fakirpada", "presidency resort", "patapur", "padmalava nagar", "hanuman temple", "sandhapur", "vidayadhar pur", "sandhapur", "sandhapur hwc", "srisri university gate 1", "ommfeed dairy", "inspection and certification centre", "naraj barrage", "Naraj Railway Station", "marthapur"]
  },
  {
    route: "38",
    start: "Bhubaneswar Railway Station",
    destination: "Trimal",
    stops: "Master canteen Janpath, sriya sq, ram mandir, satya nagar sq, satya nagar, maharshi college, Rupali square, rd women college, vani vihar, acharya vihar sq, immt, jaydev vihar square, nabard, iskon temple, nayapalli, crpf sq, gopabandhu nagar, fire station, Rajdhani college, baramunda bsabt, khandagiri bypass, khandagiri sq, kolathia 1, aginia 1, allugodam, patrapada 1, k9, kalinga vihar sq, tamando, biji pur, gohiriasq, retang sq, janla post office, janla medical, ogala pada, bhuasuni temple, jatani gate, ganga pada, pitapalli sq, khordha bypass sq, bsf battalion campl, padanpur, niser, iit road, bhakati Vedanta institute, iit badaraghunathpur, swosti, cohen, sdi main campus, tite, taraboi, makeirana temple, bena panjari, medical chaka, trimal",
    stopsList: ["Master canteen Janpath", "sriya sq", "ram mandir", "satya nagar sq", "satya nagar", "maharshi college", "Rupali square", "rd women college", "vani vihar", "acharya vihar sq", "immt", "jaydev vihar square", "nabard", "iskon temple", "nayapalli", "crpf sq", "gopabandhu nagar", "fire station", "Rajdhani college", "baramunda bsabt", "khandagiri bypass", "khandagiri sq", "kolathia 1", "aginia 1", "allugodam", "patrapada 1", "k9", "kalinga vihar sq", "tamando", "biji pur", "gohiriasq", "retang sq", "janla post office", "janla medical", "ogala pada", "bhuasuni temple", "jatani gate", "ganga pada", "pitapalli sq", "khordha bypass sq", "bsf battalion campl", "padanpur", "niser", "iit road", "bhakati Vedanta institute", "iit badaraghunathpur", "swosti", "cohen", "sdi main campus", "tite", "taraboi", "makeirana temple", "bena panjari", "medical chaka", "trimal"]
  },
  {
    route: "39",
    start: "Bhubaneswar Railway Station",
    destination: "AIIMS",
    stops: "Master canteen, ashok nagar, raj mahal sq, unit 1 haat, ag sq, capital hospital, new airport sq, old airport square, navin niwas, palaspalli, punamaflyover, bhimatangi, ekamra college, lingraj station, sudandar pada haat, pokhariput, housing board colony, madhushudan park, kalbhumi, gandamuda iter college, jagamara, jagnnath temple, khandagiri sq, kolathia 1, aginia 1, kids hospital road, allugodam 1, police academy",
    stopsList: ["Master canteen", "ashok nagar", "raj mahal sq", "unit 1 haat", "ag sq", "capital hospital", "new airport sq", "old airport square", "navin niwas", "palaspalli", "punamaflyover", "bhimatangi", "ekamra college", "lingraj station", "sudandar pada haat", "pokhariput", "housing board colony", "madhushudan park", "kalbhumi", "gandamuda iter college", "jagamara", "jagnnath temple", "khandagiri sq", "kolathia 1", "aginia 1", "kids hospital road", "allugodam 1", "police academy"]
  },
  {
    route: "40",
    start: "AIIMS",
    destination: "Sai Mandir (Kesora)",
    stops: "Police academy, alugodam, patrapada 1, kids hospital road, aiginia 1, kolathia, khandagiri square, khandagiri square, baramunda bsabt, Rajdhani college, fire station sq, Vivekananda hospital, delta sq, stabdi nagar, city women college, ouat sq, ouat clg, ganga nagar sq, unit 6, new airport sq, capital hospital, ag sq, unit 1 haat, raajmahal sq, Ri office, bjem school, Vishwanath nagar, badagad haat, badagada highschool, bagada police station, panchupanda cave, bda park, badagada brit colony, megheswar temple, sai madir, sr valley, mangraj point, jena market, kordakanta square, sbi colony kesora",
    stopsList: ["Police academy", "alugodam", "patrapada 1", "kids hospital road", "aiginia 1", "kolathia", "khandagiri square", "baramunda bsabt", "Rajdhani college", "fire station sq", "Vivekananda hospital", "delta sq", "stabdi nagar", "city women college", "ouat sq", "ouat clg", "ganga nagar sq", "unit 6", "new airport sq", "capital hospital", "ag sq", "unit 1 haat", "raajmahal sq", "Ri office", "bjem school", "Vishwanath nagar", "badagad haat", "badagada highschool", "bagada police station", "panchupanda cave", "bda park", "badagada brit colony", "megheswar temple", "sai madir", "sr valley", "mangraj point", "jena market", "kordakanta square", "sbi colony kesora"]
  },
  {
    route: "41",
    start: "Baramunda BSABT",
    destination: "driems",
    stops: "Baramunda bsabt, baramunda, Rajdhani college, fire station, square, gopabandhu nagar, crpf square, nayapalli, iskcon temple, nabard, jaydev vihar square, immt, Acharya vihar, vani vihar, vani vihar square, satsangha vihar, vss nagar road, rasulgarh sq, palasuni, saptasati temple, hi tech hospital sq, hasnpal sq, puri canal road, highway honda, Utkal heights, millenium city, pahal, apex college, nakhra square, bamphakuda, telenga pentha, delta gada, Pratap nagari, bhanpur, balikuda, gopalpurlrailway station, khapuria sq, link road, nishamani talkies, arundoya market, pala mandap, badam badi bus stand, badambadi bus stand, pala mandap, aurndoya market, nishamani talkies, link road, samrat cinema, omp square, gandarpur, shikharapur, jagatpur, tahasil road, nankar, kendrapara canal road, sai vihar, manguli, nergundi, harianta, karanji, odisha adarash Vidyalaya kandarkana, sapanpur road, tangi, drimes",
    stopsList: ["Baramunda bsabt", "baramunda", "Rajdhani college", "fire station, square", "gopabandhu nagar", "crpf square", "nayapalli", "iskcon temple", "nabard", "jaydev vihar square", "immt", "Acharya vihar", "vani vihar", "vani vihar square", "satsangha vihar", "vss nagar road", "rasulgarh sq", "palasuni", "saptasati temple", "hi tech hospital sq", "hasnpal sq", "puri canal road", "highway honda", "Utkal heights", "millenium city", "pahal", "apex college", "nakhra square", "bamphakuda", "telenga pentha", "delta gada", "Pratap nagari", "bhanpur", "balikuda", "gopalpurlrailway station", "khapuria sq", "link road", "nishamani talkies", "arundoya market", "pala mandap", "badam badi bus stand", "badambadi bus stand", "pala mandap", "aurndoya market", "nishamani talkies", "link road", "samrat cinema", "omp square", "gandarpur", "shikharapur", "jagatpur", "tahasil road", "nankar", "kendrapara canal road", "sai vihar", "manguli", "nergundi", "harianta", "karanji", "odisha adarash Vidyalaya kandarkana", "sapanpur road", "tangi", "drimes"]
  },
  {
    route: "42",
    start: "Baramunda BSABT",
    destination: "Nandankanan",
    stops: "Baramunda bsabt, baramunda, Rajdhani college, fire station, square, crpf kv, rental colony, jagannath vihar agriculture directorate, kalinga studio square, bharatpur, bharatpur uphc, ga colony shree ram vihar, ga colony b1, institute of mathematics and applications andharua, radhamadhab nagar, ganeshinstitue, lifestyle orchid, dn wisdom school, institute of healthe sciences, chandaka market, chandaka, chadaka college, sog, shayamsundapur, daruthenga, daruthenga high school, jujhagada, bhalunka road, orisa, diese, jungle view, barang sitaram bazar, barang square, barang, nandankanana, nandan kana high school",
    stopsList: ["Baramunda bsabt", "baramunda", "Rajdhani college", "fire station, square", "crpf kv", "rental colony", "jagannath vihar agriculture directorate", "kalinga studio square", "bharatpur", "bharatpur uphc", "ga colony shree ram vihar", "ga colony b1", "institute of mathematics and applications andharua", "radhamadhab nagar", "ganeshinstitue", "lifestyle orchid", "dn wisdom school", "institute of healthe sciences", "chandaka market", "chandaka", "chadaka college", "sog", "shayamsundapur", "daruthenga", "daruthenga high school", "jujhagada", "bhalunka road", "orisa", "diese", "jungle view", "barang sitaram bazar", "barang square", "barang", "nandankanana", "nandan kana high school"]
  },
  {
    route: "43",
    start: "Baramunda BSABT",
    destination: "Banamalipur",
    stops: "Baramunda bsabt, baramunda, rajhdani college, fire station square, crpf square, nayapalli, iskcon, nabard, jayedev vihar flyaove, immt, achrya vihar sq, vani vihar, vani vihar sq, satsang vihar, vss nagar road, rasulgarh sq, rasulgada market, bomikhal, ekmara talkies, jharpad, yatri nivas, laxmi sagar sq, old station bazar, railway station, Kalpna sq, statemuseum, bjb clg, ncc canteen, shree hospital, rabi talkies, kedar gouri temple, garage chaak, samantrya pur, nuagaon, shishupalagarh, lingipur, shree shree borada hospital, Natha pur, dhauli sq, balis ahi, utara sq, saradei pur, balakati govt school, balakati, balakati post office, duladei temple, capital academy, manjary hospital, puran Padhan, budhipada chaak, sisilo, Biswanath pur, madhuban chhak, budhanath temple, balipatana, giringo, athantar, dhanahar, nuasahi, bata bazaar, banamalipur, nuapatana, banamalipur mdical chhaka",
    stopsList: ["Baramunda bsabt", "baramunda", "rajhdani college", "fire station square", "crpf square", "nayapalli", "iskcon", "nabard", "jayedev vihar flyaove", "immt", "achrya vihar sq", "vani vihar", "vani vihar sq", "satsang vihar", "vss nagar road", "rasulgarh sq", "rasulgada market", "bomikhal", "ekmara talkies", "jharpad", "yatri nivas", "laxmi sagar sq", "old station bazar", "railway station", "Kalpna sq", "statemuseum", "bjb clg", "ncc canteen", "shree hospital", "rabi talkies", "kedar gouri temple", "garage chaak", "samantrya pur", "nuagaon", "shishupalagarh", "lingipur", "shree shree borada hospital", "Natha pur", "dhauli sq", "balis ahi", "utara sq", "saradei pur", "balakati govt school", "balakati", "balakati post office", "duladei temple", "capital academy", "manjary hospital", "puran Padhan", "budhipada chaak", "sisilo", "Biswanath pur", "madhuban chhak", "budhanath temple", "balipatana", "giringo", "athantar", "dhanahar", "nuasahi", "bata bazaar", "banamalipur", "nuapatana", "banamalipur mdical chhaka"]
  },
  {
    route: "44",
    start: "Baramunda BSABT",
    destination: "SVNIRTAR, Olatpur",
    stops: "Baramunda bsabt, baramunda, rajhdani college, fire station square, crpf square, nayapalli, iskcon, nabard, jayedev vihar flyaove, immt, achrya vihar sq, vani vihar, vani vihar sq, rd women clg, Rupali sq, maharshi clg, satya nagar, satya nagar sq, ram mandir, sriya sq, master canteen Janpath, Bhubaneswar railway station, master canteen, ashok nagar, raj mahal sq, Kalpana sq, sabarshi lane, old station bazar, laxmisagar sq, yatri nivas, jharpada, ekamra talkies, bomikhal, rasulgarh market, rasulgarh sq, palasuni, saptasati temple, high tech hospital school, hanspal sq, puri canal road, high honda, Bishnu vihar, Utkal height, mellenium city, pahal, apex college, nakhara sq, dps kaling, kharavel estate, synegy college, midland height, jaypur road, east college trinath bazar, pachabati bazar, bateswar Mahadev tmpel, bahani nagar phase 2, polic aid brahamani jharilo, kuranga sudhanada colleg, ocean water park, snowman logistics, bada jharilo, sundagram, dadhichi group, bagalpur panchayat office dakineswar Mahadev temple, jharapda road, kantapada, pwd dakabangala kantapada, olatapur, svnirtar olatpur",
    stopsList: ["Baramunda bsabt", "baramunda", "rajhdani college", "fire station square", "crpf square", "nayapalli", "iskcon", "nabard", "jayedev vihar flyaove", "immt", "achrya vihar sq", "vani vihar", "vani vihar sq", "rd women clg", "Rupali sq", "maharshi clg", "satya nagar", "satya nagar sq", "ram mandir", "sriya sq", "master canteen Janpath", "Bhubaneswar railway station", "master canteen", "ashok nagar", "raj mahal sq", "Kalpana sq", "sabarshi lane", "old station bazar", "laxmisagar sq", "yatri nivas", "jharpada", "ekamra talkies", "bomikhal", "rasulgarh market", "rasulgarh sq", "palasuni", "saptasati temple", "high tech hospital school", "hanspal sq", "puri canal road", "high honda", "Bishnu vihar", "Utkal height", "mellenium city", "pahal", "apex college", "nakhara sq", "dps kaling", "kharavel estate", "synegy college", "midland height", "jaypur road", "east college trinath bazar", "pachabati bazar", "bateswar Mahadev tmpel", "bahani nagar phase 2", "polic aid brahamani jharilo", "kuranga sudhanada colleg", "ocean water park", "snowman logistics", "bada jharilo", "sundagram", "dadhichi group", "bagalpur panchayat office dakineswar Mahadev temple", "jharapda road", "kantapada", "pwd dakabangala kantapada", "olatapur", "svnirtar olatpur"]
  },
  {
    route: "45",
    start: "Bhubaneswar Railway Station",
    destination: "Jayadev Pitha",
    stops: "Master canteen, ashok nagar, raj mahal sq, kalpanan sq, state museum, bjb college, ncc canteen, shree hospital, ravi talkies, raja rani temple, chili pokhari, Ratnakar bagh, bramheswar patna, megheswar temple, sai mandir, sai residency, Tarini mandir, ranga bazar, bjem school, gotalgram, andhoti bazar, brahman sarangi up school, brahman sarangi, patapur chhak, raedpada, jagannathpur, khamanga sasan, kakarudrapur high school, kakarudrapur, prataprudrapur grama panchayat, prataprudra, apata sahi, upara sahi, Jayadev pitha",
    stopsList: ["Master canteen", "ashok nagar", "raj mahal sq", "kalpanan sq", "state museum", "bjb college", "ncc canteen", "shree hospital", "ravi talkies", "raja rani temple", "chili pokhari", "Ratnakar bagh", "bramheswar patna", "megheswar temple", "sai mandir", "sai residency", "Tarini mandir", "ranga bazar", "bjem school", "gotalgram", "andhoti bazar", "brahman sarangi up school", "brahman sarangi", "patapur chhak", "raedpada", "jagannathpur", "khamanga sasan", "kakarudrapur high school", "kakarudrapur", "prataprudrapur grama panchayat", "prataprudra", "apata sahi", "upara sahi", "Jayadev pitha"]
  },
  {
    route: "46",
    start: "Bhubaneswar Railway Station",
    destination: "Nandankanan high school",
    stops: "Master cateen, sriya sq, ram mandir, satya nagar sq, satya nagar, maharshi college, Rupali square, rd women college, vani vihar, satsang vihar, vss nagar road, rasulgarh sq, palasuni, saptasai temple, hi tech hospital sq, mancheswar road, mancheswar temple, mancheswar village, gyan Barati college, jaripatana ramagada sahi, maruti mandap, bada dia sahi, kalayanpur, bengadia, gadnarpur high school chhak, majhi sahi, gandarpur, khairpada, bada balipada, kendupatna, xavier highschool balipada, kendupatna college square, kunja Bihari college, Kanpur chhak, kantapatna, barangay block, barang police station, barang, nandankanan",
    stopsList: ["Master cateen", "sriya sq", "ram mandir", "satya nagar sq", "satya nagar", "maharshi college", "Rupali square", "rd women college", "vani vihar", "satsang vihar", "vss nagar road", "rasulgarh sq", "palasuni", "saptasai temple", "hi tech hospital sq", "mancheswar road", "mancheswar temple", "mancheswar village", "gyan Barati college", "jaripatana ramagada sahi", "maruti mandap", "bada dia sahi", "kalayanpur", "bengadia", "gadnarpur high school chhak", "majhi sahi", "gandarpur", "khairpada", "bada balipada", "kendupatna", "xavier highschool balipada", "kendupatna college square", "kunja Bihari college", "Kanpur chhak", "kantapatna", "barangay block", "barang police station", "barang", "nandankanan"]
  },
  {
    route: "47",
    start: "Igkc hospital",
    destination: "SCB Medical, Cuttack",
    stops: "Sum hospital, shyampur, ayurveda college, kalinga studio square, agriculture, directorate, jagannath vihar, rental colony, government high school, crp baramunda, vip colony irc village, icsi house, ekamra park, salia sahi chhak, mayfair raod, jaydev vihar, square, pal heighs, mayfair raod, Janata maidam xavier square, fortune tower, kalinga hospital square, rail sadan omfed square, Niladri vihar square damana square, chandrashekharpur police station, patia square, koel campus, kanan vihar phase 2, sikharchandi vihar, nandan vihar, mani tribhuban, royal lagoon, Raghunathpur, Raghunathpur village, dauladei temple, nandan kannana high school, nandan Kannan, barang, barang ps, barang block, bachhipur, madhuban, trisulia sq, kunheipara, judicial academy, sishu bhawan, high court road, cuttack sai temple, puri ghaat, police station, city college, cnbt, badam badi square, badam badi bus stand, pala mandap, arun doya market, nishamani talkies, linkroad, samrat, c inema, omp square, cuttack railway station, Ravenshaw univer sity, clock tower, Balaji hospital scb medical settlement office",
    stopsList: ["Sum hospital", "shyampur", "ayurveda college", "kalinga studio square", "agriculture, directorate", "jagannath vihar", "rental colony", "government high school", "crp baramunda", "vip colony irc village", "icsi house", "ekamra park", "salia sahi chhak", "mayfair raod", "jaydev vihar, square", "pal heighs", "mayfair raod", "Janata maidam xavier square", "fortune tower", "kalinga hospital square", "rail sadan omfed square", "Niladri vihar square damana square", "chandrashekharpur police station", "patia square", "koel campus", "kanan vihar phase 2", "sikharchandi vihar", "nandan vihar", "mani tribhuban", "royal lagoon", "Raghunathpur", "Raghunathpur village", "dauladei temple", "nandan kannana high school", "nandan Kannan", "barang", "barang ps", "barang block", "bachhipur", "madhuban", "trisulia sq", "kunheipara", "judicial academy", "sishu bhawan", "high court road", "cuttack sai temple", "puri ghaat", "police station", "city college", "cnbt", "badam badi square", "badam badi bus stand", "pala mandap", "arun doya market", "nishamani talkies", "linkroad", "samrat, c inema", "omp square", "cuttack railway station", "Ravenshaw univer sity", "clock tower", "Balaji hospital scb medical settlement office"]
  },
  {
    route: "48",
    start: "Khordha New Bus Stand",
    destination: "Jagatpur, Cuttack",
    stops: "Pallahata square, old collector office, drda, gada khordaha, barunei pitha, uphc, pn clg, khordha bypass square, pitapalli pertrol pump, pitapalli sq, viswaas college, Bhubaneswar engineering college, mahir gorup of institution, panipra, pala sur, niis group of institutions, panior palasur, niis gorup of institutions, chatabar, biju Patnaik open air ashram, mendhasal, community health centre optcl grid sub station, gringaput, adurta sishusandan, kateni kantabada bazar, sparsh hospital, godibari nattue camp, godibari village, asbm bhola sq, dalua square, Nalanda institute of technology, Chandak amarket, chandaka, sog, shayamsundarpur, daruhenga, daruthenga high school, jujhagad, bhalunka road, orrisa diesel, jungle view, barang sitaram bazar, barang sitaram bazar, barang square, barang police station, bachhipur, bachhipur, madhuban, trisulia sq, kunheipara, judicial academy, sishu bhawan, high court road, cuttack sai temple, puri ghaat, police station, city college, cnbt, badam badi square, badam badi bus stand, pala mandap, arun doya market, nishamani talkies, linkroad, smarat cinema, omp sq, gandapur, shirkharapur, jagatpur",
    stopsList: ["Pallahata square", "old collector office", "drda", "gada khordaha", "barunei pitha", "uphc", "pn clg", "khordha bypass square", "pitapalli pertrol pump", "pitapalli sq", "viswaas college", "Bhubaneswar engineering college", "mahir gorup of institution", "panipra", "pala sur", "niis group of institutions", "panior palasur", "niis gorup of institutions", "chatabar", "biju Patnaik open air ashram", "mendhasal", "community health centre optcl grid sub station", "gringaput", "adurta sishusandan", "kateni kantabada bazar", "sparsh hospital", "godibari nattue camp", "godibari village", "asbm bhola sq", "dalua square", "Nalanda institute of technology", "Chandak amarket", "chandaka", "sog", "shayamsundarpur", "daruhenga", "daruthenga high school", "jujhagad", "bhalunka road", "orrisa diesel", "jungle view", "barang sitaram bazar", "barang sitaram bazar", "barang square", "barang police station", "bachhipur", "bachhipur", "madhuban", "trisulia sq", "kunheipara", "judicial academy", "sishu bhawan", "high court road", "cuttack sai temple", "puri ghaat", "police station", "city college", "cnbt", "badam badi square", "badam badi bus stand", "pala mandap", "arun doya market", "nishamani talkies", "linkroad", "smarat cinema", "omp sq", "gandapur", "shirkharapur", "jagatpur"]
  },
  {
    route: "49",
    start: "Bhubaneswar Railway Station",
    destination: "Delanga Hata",
    stops: "Master canteen, ashok nagar, raj mahal sq, Kalpana sq, state museum, bjb college, ncc canteen, shree hospital, ravi takies, kedar gauri temple, gauri nagar, garaj chowk, Mahaveer chowk, Samantaraypur, ganguabridge, nuagaon, gongotri nagar road 3, sishupal ghara, lingipur, shree shree borda hospital, Natha pur, dhauli sq, bali shahi, Uttara sq, cifa, kec college, gudia pokhari sq, hightech heaven, siula, loards sway apartment, Gobardhan pur, jhikiniri mal, Jayesh patina chawk, pipili bypass, pipili nimapada chawk, pipili police station, pipli market, pipili college chhak, jaypurdidi, delanga chhak, danagohiri square, Bajpayee chhakka, nuagaon, arisala square, khelaura, baramhana tarboi, oda taraboi, delenga bazar, beraboi, delanga railwaya station, manijipu, ramachnadrpur, puruna delanga",
    stopsList: ["Master canteen", "ashok nagar", "raj mahal sq", "Kalpana sq", "state museum", "bjb college", "ncc canteen", "shree hospital", "ravi takies", "kedar gauri temple", "gauri nagar", "garaj chowk", "Mahaveer chowk", "Samantaraypur", "ganguabridge", "nuagaon", "gongotri nagar road 3", "sishupal ghara", "lingipur", "shree shree borda hospital", "Natha pur", "dhauli sq", "bali shahi", "Uttara sq", "cifa", "kec college", "gudia pokhari sq", "hightech heaven", "siula", "loards sway apartment", "Gobardhan pur", "jhikiniri mal", "Jayesh patina chawk", "pipili bypass", "pipili nimapada chawk", "pipili police station", "pipli market", "pipili college chhak", "jaypurdidi", "delanga chhak", "danagohiri square", "Bajpayee chhakka", "nuagaon", "arisala square", "khelaura", "baramhana tarboi", "oda taraboi", "delenga bazar", "beraboi", "delanga railwaya station", "manijipu", "ramachnadrpur", "puruna delanga"]
  },
  {
    route: "50",
    start: "Bhubaneswar Railway Station",
    destination: "Puri Bus Stand",
    stops: "Raajmahal sq, state museum, ravi talkies, samantarapur, dhauli square, Uttara square, pippli bypass, satasankha, sakhigopal, Chandanpur bazar, maltipur, athra nala",
    stopsList: ["Raajmahal sq", "state museum", "ravi talkies", "samantarapur", "dhauli square", "Uttara square", "pippli bypass", "satasankha", "sakhigopal", "Chandanpur bazar", "maltipur", "athra nala"]
  },
  {
    route: "51",
    start: "Baramunda BSABT",
    destination: "Puri Bus Stand",
    stops: "Rajdhani clg, fire station sq, crpf sq, nabard, immt, acharya vihar, vani vihar square, rasulgarh sq, bomikhal, jharpada, laxmi sagar square, old station bazar or railway station, statemuseum, ravi talkies, garaj chaak, Mahavir chowk, samantarapur, nuagaon, Gangotri nagar road 3, lingipur, dhulisquare, balisahi, Uttara sq, cifa kec clg, gudia pokhari sq, hi tech heaven, loard way apartment, Gobardhanpur, jhinirimal, jaishpatna chowk, pipili bypass, pippli over bridge square, danda munkundapur bypass, mangal pur, tisipur, satsankha, pattnaikia, sakhigopal college, chandapur bypass, birapratap pur, bira narasinghapur, chhaka, damodarpur bazar, chandanpur bazar, tulasi chaura chaka, maltipatpur, bira harekrushnapur, bata magla temple, atharanala, matipada square",
    stopsList: ["Rajdhani clg", "fire station sq", "crpf sq", "nabard", "immt", "acharya vihar", "vani vihar square", "rasulgarh sq", "bomikhal", "jharpada", "laxmi sagar square", "old station bazar or railway station", "statemuseum", "ravi talkies", "garaj chaak", "Mahavir chowk", "samantarapur", "nuagaon", "Gangotri nagar road 3", "lingipur", "dhulisquare", "balisahi", "Uttara sq", "cifa kec clg", "gudia pokhari sq", "hi tech heaven", "loard way apartment", "Gobardhanpur", "jhinirimal", "jaishpatna chowk", "pipili bypass", "pippli over bridge square", "danda munkundapur bypass", "mangal pur", "tisipur", "satsankha", "pattnaikia", "sakhigopal college", "chandapur bypass", "birapratap pur", "bira narasinghapur", "chhaka", "damodarpur bazar", "chandanpur bazar", "tulasi chaura chaka", "maltipatpur", "bira harekrushnapur", "bata magla temple", "atharanala", "matipada square"]
  },
  {
    route: "52",
    start: "Puri Bus Stand",
    destination: "Omkareshwar Temple",
    stops: "Puri railway station, zila school, old sadar police station, wild grass, subhash bose square, collector office, sear beach road, Chaitanya sq, sqrgadwar, light house, bipad trini temple, hotel swosti premium, sipasurubili square, hotel ananaya, omkareswartemple, Jagadguru Kripalu dham, surajmal, saha clg, aksahya patra foundation, mangalaghat square",
    stopsList: ["Puri railway station", "zila school", "old sadar police station", "wild grass", "subhash bose square", "collector office", "sear beach road", "Chaitanya sq", "sqrgadwar", "light house", "bipad trini temple", "hotel swosti premium", "sipasurubili square", "hotel ananaya", "omkareswartemple", "Jagadguru Kripalu dham", "surajmal", "saha clg", "aksahya patra foundation", "mangalaghat square"]
  },
  {
    route: "53",
    start: "Malatipatpur Bus Stand",
    destination: "Shree Mandira",
    stops: "Bira harkrushnapur, bata mangala temple, athara naala, mati pada square, puri bus stand, Bholanath vidyapith, redcross road, medical square, municipality market square, shree mandira",
    stopsList: ["Bira harkrushnapur", "bata mangala temple", "athara naala", "mati pada square", "puri bus stand", "Bholanath vidyapith", "redcross road", "medical square", "municipality market square", "shree mandira"]
  },
  {
    route: "54",
    start: "NLU, Cuttack",
    destination: "Puri Bus Stand",
    stops: "NLU, Badambadi, Link Road, Rasulgarh, Kalpana Square, Uttara, Pipili, Sakhigopal, Puri Bus Stand",
    stopsList: ["NLU", "Badambadi", "Link Road", "Rasulgarh", "Kalpana Square", "Uttara", "Pipili", "Sakhigopal", "Puri Bus Stand"]
  },
  {
    route: "56",
    start: "Khordha New Bus Stand",
    destination: "Puri Bus Stand",
    stops: "Khordha New Bus Stand, Jatani, Pipili, Sakhigopal, Puri Bus Stand",
    stopsList: ["Khordha New Bus Stand", "Jatani", "Pipili", "Sakhigopal", "Puri Bus Stand"]
  },
  {
    route: "58",
    start: "Jagatpur, Cuttack",
    destination: "Puri Bus Stand",
    stops: "Jagatpur, OMP Square, Link Road, Rasulgarh, Kalpana Square, Uttara, Pipili, Sakhigopal, Puri Bus Stand",
    stopsList: ["Jagatpur", "OMP Square", "Link Road", "Rasulgarh", "Kalpana Square", "Uttara", "Pipili", "Sakhigopal", "Puri Bus Stand"]
  },
  {
    route: "59",
    start: "Mahanadi Vihar, Cuttack",
    destination: "Puri Bus Stand",
    stops: "Mahanadi Vihar, Badambadi, Link Road, Rasulgarh, Kalpana Square, Uttara, Pipili, Sakhigopal, Puri Bus Stand",
    stopsList: ["Mahanadi Vihar", "Badambadi", "Link Road", "Rasulgarh", "Kalpana Square", "Uttara", "Pipili", "Sakhigopal", "Puri Bus Stand"]
  },
  {
    route: "62",
    start: "Bhubaneswar Railway Station",
    destination: "Suando",
    stops: "Master Canteen, Kalpana Square, Samantarapur, Dhauli Square, Uttara Square, Pipili Bypass, Pattanaikia, Suando",
    stopsList: ["Master Canteen", "Kalpana Square", "Samantarapur", "Dhauli Square", "Uttara Square", "Pipili Bypass", "Pattanaikia", "Suando"]
  },
  {
    route: "63",
    start: "BSABT",
    destination: "Madhabananda Temple, Niali",
    stops: "Baramunda BSABT, Vani Vihar, Master Canteen, Rasulgarh, Hanspal, Nakhara, Adaspur, Madhabananda Temple Niali",
    stopsList: ["Baramunda BSABT", "Vani Vihar", "Master Canteen", "Rasulgarh", "Hanspal", "Nakhara", "Adaspur", "Madhabananda Temple Niali"]
  },
  {
    route: "64",
    start: "Bhubaneswar Railway Station",
    destination: "Jatani Gate",
    stops: "Master Canteen, Vani Vihar, Khandagiri, Gohiria Square, Madanpur, Bagchi Sri Shankara Hospital, Jatani Gate",
    stopsList: ["Master Canteen", "Vani Vihar", "Khandagiri", "Gohiria Square", "Madanpur", "Bagchi Sri Shankara Hospital", "Jatani Gate"]
  },
  {
    route: "65",
    start: "Bhubaneswar Railway Station",
    destination: "Wonderla Amusement Park",
    stops: "Master Canteen, Vani Vihar, Acharya Vihar, Jayadev Vihar, Khandagiri, Pitapalli, Wonderla Amusement Park",
    stopsList: ["Master Canteen", "Vani Vihar", "Acharya Vihar", "Jayadev Vihar", "Khandagiri", "Pitapalli", "Wonderla Amusement Park"]
  },
  {
    route: "66",
    start: "Airport",
    destination: "Pathargadia Square",
    stops: "Biju Patnaik Airport, Capital Hospital, AG Square, Vani Vihar, Acharya Vihar, Jayadev Vihar, Kiss College, Kelucharan Park, Pathargadia Square",
    stopsList: ["Biju Patnaik Airport", "Capital Hospital", "AG Square", "Vani Vihar", "Acharya Vihar", "Jayadev Vihar", "Kiss College", "Kelucharan Park", "Pathargadia Square"]
  },
  {
    route: "70",
    start: "Bhubaneswar Railway Station",
    destination: "Konark",
    stops: "Master Canteen, Kalpana Square, Ravi Talkies, Samantarapur, Uttara Square, Pipili Bypass, Nimapada, Gop, Konark Sun Temple",
    stopsList: ["Master Canteen", "Kalpana Square", "Ravi Talkies", "Samantarapur", "Uttara Square", "Pipili Bypass", "Nimapada", "Gop", "Konark Sun Temple"]
  },
  {
    route: "71",
    start: "Baramunda BSABT",
    destination: "Konark",
    stops: "Baramunda BSABT, Fire Station, CRPF, Jayadev Vihar, Vani Vihar, Rasulgarh Square, Hanspal, Nakhara, Nimapada, Gop, Konark Sun Temple",
    stopsList: ["Baramunda BSABT", "Fire Station", "CRPF", "Jayadev Vihar", "Vani Vihar", "Rasulgarh Square", "Hanspal", "Nakhara", "Nimapada", "Gop", "Konark Sun Temple"]
  },
  {
    route: "72",
    start: "Shree Mandira",
    destination: "Madhabananda Temple",
    stops: "Shree mandir, Municipalty market sqr, Medical Sqr, Red cross road, saradhabali, Matiapada sqr, SiddhaMahavir, Balighat, Grid station, Nagapatana, BBSR bypass, Toshali, Beldala, BG College Balighai, Balighai, Chhaitana Market, Salipatana Road, Alasaranga, Jaunli Pokhari Market, Dalanai, Madaranga Bazar, Nagapur, Solapur, Subarnapur, Ganeswarpur, kalyan pur, Gop bazar, Khadisa, Gotha Chhak, Asha Purana, Tampala, Alakunda, Chari Chhak, Ratanpur, Nageshwar, Madhaba nanda temple",
    stopsList: ["Shree mandir", "Municipalty market sqr", "Medical Sqr", "Red cross road", "saradhabali", "Matiapada sqr", "SiddhaMahavir", "Balighat", "Grid station", "Nagapatana", "BBSR bypass", "Toshali", "Beldala", "BG College Balighai", "Balighai", "Chhaitana Market", "Salipatana Road", "Alasaranga", "Jaunli Pokhari Market", "Dalanai", "Madaranga Bazar", "Nagapur", "Solapur", "Subarnapur", "Ganeswarpur", "kalyan pur", "Gop bazar", "Khadisa", "Gotha Chhak", "Asha Purana", "Tampala", "Alakunda", "Chari Chhak", "Ratanpur", "Nageshwar", "Madhaba nanda temple"]
  },
  {
    route: "73",
    start: "Puri Bus Stand",
    destination: "Jagannath Medical College",
    stops: "Talabania Bus stand, Jagannath Standium, Bedi Hanuman, RTO Puri, BNR Hotel, District agriculture office, Govt women college, Puri Railway station, Jhadeshwari Sqr, Police line, Medical Sqr, Mausimaa temple, Municipalty market sqr, Shree Mandir",
    stopsList: ["Talabania Bus stand", "Jagannath Standium", "Bedi Hanuman", "RTO Puri", "BNR Hotel", "District agriculture office", "Govt women college", "Puri Railway station", "Jhadeshwari Sqr", "Police line", "Medical Sqr", "Mausimaa temple", "Municipalty market sqr", "Shree Mandir"]
  },
  {
    route: "74",
    start: "Puri Railway Station",
    destination: "Shree Mandira",
    stops: "Puri Railway Station, Puri Bus stand, Bholanath Bidyapith, Red cross road, Medical Road, Municipalty market sqr, Shree Mandira",
    stopsList: ["Puri Railway Station", "Puri Bus stand", "Bholanath Bidyapith", "Red cross road", "Medical Road", "Municipalty market sqr", "Shree Mandira"]
  },
  {
    route: "75",
    start: "Shree Mandira",
    destination: "Kakatpur",
    stops: "Old bus stand kakatpur, Old college chhak, Kakatpur new bus stand, block chhak, Balara, Othaka Hata, Pradhan Sahi, Patapur, Chanapur, Haridas pur, Bali Sahi, Chotrapur, Kundhei Hata, Ram mandir Kundhei, Sankareswar, Chena Chak, Anand Bazar, Asijanga, Gopabandhu Chaka, Tikarpada, Indra Bazar, Balidokan, Jamara, Kurujang, Adarsha Vidyalaya, Badhei Chhak, Raulapatna, Konark, Urban Market, Chandrabhaga Beach, Lotus Resort, Ramachandi, Bali kapileshwar, District Jail Puri, DRDO, Ghanshyam Hemalata College, Balighai, Blue Splash Waterpark, Beldala, Toshali, BBSR Bypass, Nagapatana, GRID Station, SiddhaMahavir, Matiapada sqr, Puri Bus Stand, Red Cross Road, Medical Sqr, Municipalty market sqr, Shree Mandira",
    stopsList: ["Old bus stand kakatpur", "Old college chhak", "Kakatpur new bus stand", "block chhak", "Balara", "Othaka Hata", "Pradhan Sahi", "Patapur", "Chanapur", "Haridas pur", "Bali Sahi", "Chotrapur", "Kundhei Hata", "Ram mandir Kundhei", "Sankareswar", "Chena Chak", "Anand Bazar", "Asijanga", "Gopabandhu Chaka", "Tikarpada", "Indra Bazar", "Balidokan", "Jamara", "Kurujang", "Adarsha Vidyalaya", "Badhei Chhak", "Raulapatna", "Konark", "Urban Market", "Chandrabhaga Beach", "Lotus Resort", "Ramachandi", "Bali kapileshwar", "District Jail Puri", "DRDO", "Ghanshyam Hemalata College", "Balighai", "Blue Splash Waterpark", "Beldala", "Toshali", "BBSR Bypass", "Nagapatana", "GRID Station", "SiddhaMahavir", "Matiapada sqr", "Puri Bus Stand", "Red Cross Road", "Medical Sqr", "Municipalty market sqr", "Shree Mandira"]
  },
  {
    route: "76",
    start: "Puri Bus Stand",
    destination: "Sakhigopal Temple",
    stops: "Sakhigopal temple, Narendra Pond, RMC Market, Sakhigopal, Sakhigopal Block, Biragobindapur, Samjajpur, Chandanpur Bypass, Birapratappur, Biranarasinghapur Chhak, Damodarpur Bazar, Chandanpur Bazar, Tulasi Chaura Chhak, Malatipata pur, Charishree Road, Bata Gaon, Bira Harekrushnapur, Bata Mangala Temple, Shree Hari Vihar, Kadali Bari, Mukunda Mishra Nagar, Athara nala, Kumbharpada Police Station, Medical Chhak, Red cross road, Bholanath Vidyapith, Puri Bus Stand",
    stopsList: ["Sakhigopal temple", "Narendra Pond", "RMC Market", "Sakhigopal", "Sakhigopal Block", "Biragobindapur", "Samjajpur", "Chandanpur Bypass", "Birapratappur", "Biranarasinghapur Chhak", "Damodarpur Bazar", "Chandanpur Bazar", "Tulasi Chaura Chhak", "Malatipata pur", "Charishree Road", "Bata Gaon", "Bira Harekrushnapur", "Bata Mangala Temple", "Shree Hari Vihar", "Kadali Bari", "Mukunda Mishra Nagar", "Athara nala", "Kumbharpada Police Station", "Medical Chhak", "Red cross road", "Bholanath Vidyapith", "Puri Bus Stand"]
  },
  {
    route: "77",
    start: "Puri Bus Stand",
    destination: "Nimapada Bus Stand",
    stops: "Puri Bus Stand, Matiapada Sqr, Sidhamahavir, Balighat, Grid station, Nagapatana, BBSR Bypass, Toshali, Beldala, Blue splash water park, Balighai, Ghanshyam Hemalata college, DRDO, District Jail puri, bali kapileshwar, Ramachandi, Lotus Resort, Chandrabhaga beach, Urban Market, Nimapada Bus Stand",
    stopsList: ["Puri Bus Stand", "Matiapada Sqr", "Sidhamahavir", "Balighat", "Grid station", "Nagapatana", "BBSR Bypass", "Toshali", "Beldala", "Blue splash water park", "Balighai", "Ghanshyam Hemalata college", "DRDO", "District Jail puri", "bali kapileshwar", "Ramachandi", "Lotus Resort", "Chandrabhaga beach", "Urban Market", "Nimapada Bus Stand"]
  },
  {
    route: "78",
    start: "Shree Mandira",
    destination: "Alarnath",
    stops: "Puri Bus Stand, Bholanath Bidyapith, Medical Square, Jatia Babaji Chhak, Mashani Chandi Square, Mangalaghat Square, Khadipada Square, Khadipada, TulasiVihar Apartment, Korua, Girala, Alipada, Mothers Public School, Gorual Bazar, Gorual Village, Atibadi Jagannath Road Chhak, Haladia Chhaka, Rebana Nuagaon, Rebana Nuagoan Nodal UP School, Jagannathpur, CHC Rebana Nuagoan, Kathuaredi Square, Hatia, Alarnath College, Cinema hall square, Alarnath Temple Square, brahmagiri new bus stand",
    stopsList: ["Puri Bus Stand", "Bholanath Bidyapith", "Medical Square", "Jatia Babaji Chhak", "Mashani Chandi Square", "Mangalaghat Square", "Khadipada Square", "Khadipada", "TulasiVihar Apartment", "Korua", "Girala", "Alipada", "Mothers Public School", "Gorual Bazar", "Gorual Village", "Atibadi Jagannath Road Chhak", "Haladia Chhaka", "Rebana Nuagaon", "Rebana Nuagoan Nodal UP School", "Jagannathpur", "CHC Rebana Nuagoan", "Kathuaredi Square", "Hatia", "Alarnath College", "Cinema hall square", "Alarnath Temple Square", "brahmagiri new bus stand"]
  },
  {
    route: "79",
    start: "Shree Mandira",
    destination: "Pipili",
    stops: "hotel swosti premium, bipad tarini temple, light house, suv palace, camelia, swarg dwar, chaitaniya sq, mahodadhi palace, puri hotel, sea beach police station, kacheri, town hall, central Sanskrit uni, scs college, pkda, jhadeswari sq, police line, medical sq, mausi maa temple, municipalty market sq, sri mandir, Pipili",
    stopsList: ["hotel swosti premium", "bipad tarini temple", "light house", "suv palace", "camelia", "swarg dwar", "chaitaniya sq", "mahodadhi palace", "puri hotel", "sea beach police station", "kacheri", "town hall", "central Sanskrit uni", "scs college", "pkda", "jhadeswari sq", "police line", "medical sq", "mausi maa temple", "municipalty market sq", "sri mandir", "Pipili"]
  },
  {
    route: "80",
    start: "Naraj Police Outpost",
    destination: "Agrahat, Charbatia",
    stops: "dmti bazar, baideswar temple agrahat, charbatia, chauduwar jail, imfa gate 12, kalinga bazar, chawduar police station, gandhi chak, municipalty office choudwar, kali mandi choudwar, birupa anicut, birupa vihar sq, laxmanpur, sai sports authority of india, pandasahi road, sikhari pur, jobra anicut, settlement office, scb medical, balaji hospital, clock tower, revenshaw uni, cuttack railway station, omp sq, samrat cinema, link road, nisamani talkies, arunday market, paka mandap, badambadi bus stand, badambadi sq, cnbt, city college, puri ghat police station, cuttack sai temple, high court road, sisu bhavan, judicial academy, dagarpada road, satichaura sq, eye hospital sq, cda 6 park, cda 9 market sq, cda sector 9, drug controller office, shelter college, sims college, state bank sq, biju patnaik park, state bank sq 1, justice sq, biren mitra paek, cda sector 10, cda sector 11, netaji subhas chak cuttack, cda sector 13, revenshaw uni mahanadi campus, nluo, nluo hostel, police outpost naraj",
    stopsList: ["dmti bazar", "baideswar temple agrahat", "charbatia", "chauduwar jail", "imfa gate 12", "kalinga bazar", "chawduar police station", "gandhi chak", "municipalty office choudwar", "kali mandi choudwar", "birupa anicut", "birupa vihar sq", "laxmanpur", "sai sports authority of india", "pandasahi road", "sikhari pur", "jobra anicut", "settlement office", "scb medical", "balaji hospital", "clock tower", "revenshaw uni", "cuttack railway station", "omp sq", "samrat cinema", "link road", "nisamani talkies", "arunday market", "paka mandap", "badambadi bus stand", "badambadi sq", "cnbt", "city college", "puri ghat police station", "cuttack sai temple", "high court road", "sisu bhavan", "judicial academy", "dagarpada road", "satichaura sq", "eye hospital sq", "cda 6 park", "cda 9 market sq", "cda sector 9", "drug controller office", "shelter college", "sims college", "state bank sq", "biju patnaik park", "state bank sq 1", "justice sq", "biren mitra paek", "cda sector 10", "cda sector 11", "netaji subhas chak cuttack", "cda sector 13", "revenshaw uni mahanadi campus", "nluo", "nluo hostel", "police outpost naraj"]
  },
  {
    route: "80E",
    start: "Naraj Police Outpost",
    destination: "Mangarajpur",
    stops: "police outpost naraj, nluo, cda sector 13, netaji subhas chak, cda sector 10, biju patnaik park, justice sq, dagarpada road, judicial academy, cnbt, badambadi bus stand, link road, omp sq, cuttack railway station, scb medical, jobra anicut, choudwar, mahanadi barrage, mangarajpur",
    stopsList: ["police outpost naraj", "nluo", "cda sector 13", "netaji subhas chak", "cda sector 10", "biju patnaik park", "justice sq", "dagarpada road", "judicial academy", "cnbt", "badambadi bus stand", "link road", "omp sq", "cuttack railway station", "scb medical", "jobra anicut", "choudwar", "mahanadi barrage", "mangarajpur"]
  },
  {
    route: "81",
    start: "Barabati Stadium",
    destination: "Jagannath Temple, Salepur",
    stops: "Jagannath temple salepur, salepur, salepur market, machuati, balisahi, sisua market, bahabal pur, nalia munha, nandolgada, bhatagada, khora khia market, khora khia, bahugram, paga chaka, mahajanpur, laxmi nrusingha bazar, kazi bazar, talabazar, padampur uphc, padampur, e kart logistic hub, bhairpur, champati road, peer bazar, gunjar pur, imam nagar, khaira bridge, ipicol sq, sajguru meidcal, jagatpur police station jagatpur, sikhar pur, gandarpur, omp sq, cuttack railway station, revenshaw uni, clock tower, scb, settlemnt office, jobra anicut, taladanda bridge, odisha state meritime museum, bose college, professors colony, mata matha, machua bazar, cantanment road, odisha state police head quater, odisha public service commission, ncc csd canteen, barabati stadium",
    stopsList: ["Jagannath temple salepur", "salepur", "salepur market", "machuati", "balisahi", "sisua market", "bahabal pur", "nalia munha", "nandolgada", "bhatagada", "khora khia market", "khora khia", "bahugram", "paga chaka", "mahajanpur", "laxmi nrusingha bazar", "kazi bazar", "talabazar", "padampur uphc", "padampur", "e kart logistic hub", "bhairpur", "champati road", "peer bazar", "gunjar pur", "imam nagar", "khaira bridge", "ipicol sq", "sajguru meidcal", "jagatpur police station jagatpur", "sikhar pur", "gandarpur", "omp sq", "cuttack railway station", "revenshaw uni", "clock tower", "scb", "settlemnt office", "jobra anicut", "taladanda bridge", "odisha state meritime museum", "bose college", "professors colony", "mata matha", "machua bazar", "cantanment road", "odisha state police head quater", "odisha public service commission", "ncc csd canteen", "barabati stadium"]
  },
  {
    route: "82",
    start: "Bhubaneswar Airport",
    destination: "SCB Medical",
    stops: "biju patnaik international airport, new airport sq, capital hospital, ag sq, unut 1 haat, raj mahal sq, ashok nagar, master canteen, Bhubaneswar railway station, master canteen janpath, sriya sq, ram mandir, satya nagar sq, satya nagar, maharshi college sq, ruplai sq, rd womens college, vani vihar sq, satsang vihar, vss nagar road, rasulgarh sq, palasuni, saptasati tenple, high tech hospital sq, haspal sq, puri canal road, highway honda, assotech world, utkal heights, mellinium ciry, pahal, apex college, sum hospital campus 2, nakhara sq, bamphakuda, telenga pentha, delta gada, pratap nagri, bhanpur, balikuda, gopalpur railway station, khapuria sq, link road, samrat cinema, omp sq, cuttack railway station, revenshaw uni, clock tower, balaji hospital scb medical, settlement office",
    stopsList: ["biju patnaik international airport", "new airport sq", "capital hospital", "ag sq", "unut 1 haat", "raj mahal sq", "ashok nagar", "master canteen", "Bhubaneswar railway station", "master canteen janpath", "sriya sq", "ram mandir", "satya nagar sq", "satya nagar", "maharshi college sq", "ruplai sq", "rd womens college", "vani vihar sq", "satsang vihar", "vss nagar road", "rasulgarh sq", "palasuni", "saptasati tenple", "high tech hospital sq", "haspal sq", "puri canal road", "highway honda", "assotech world", "utkal heights", "mellinium ciry", "pahal", "apex college", "sum hospital campus 2", "nakhara sq", "bamphakuda", "telenga pentha", "delta gada", "pratap nagri", "bhanpur", "balikuda", "gopalpur railway station", "khapuria sq", "link road", "samrat cinema", "omp sq", "cuttack railway station", "revenshaw uni", "clock tower", "balaji hospital scb medical", "settlement office"]
  },
  {
    route: "83",
    start: "Dhabaleswar",
    destination: "Kandarpur",
    stops: "kandarpur, kandarpur college, athanga, chandoli bridge, baral laxminarayan temple, nilakanthanath road, baral, kulakalapada, kulasarichuan, kalapada market, deuli, dahi gaon, rautrapur village road, govindapur market, kanthunia, sbi bentakar, bentakar, dadibamanpur, sri ram market, tarini temple bramhapur, bramhapur, jhinkiriya, balisahi, ghatakula, industrial estate road, government iti cuttack, khapuriya sq, link road, nisamani talkies, arundoya market, pala mandap, badambadi bus stand, badambadi sq, cnbt, city college, puri ghat police station, cuttack sai temple, high court road, sishu bhavan, judicial academy, dagarpada road, sati choura sq, eye hospital sq, windsor palace, markatnagar cda 7, cda government hospital, ipsar, cesu or cda 9 road, icai bhavan, tonpe road, justice sq, state bank sq, biju patnaik park, madhusudan bridge sq, nuapatna road, dhabaleswar temple road, dhabaleswar",
    stopsList: ["kandarpur", "kandarpur college", "athanga", "chandoli bridge", "baral laxminarayan temple", "nilakanthanath road", "baral", "kulakalapada", "kulasarichuan", "kalapada market", "deuli", "dahi gaon", "rautrapur village road", "govindapur market", "kanthunia", "sbi bentakar", "bentakar", "dadibamanpur", "sri ram market", "tarini temple bramhapur", "bramhapur", "jhinkiriya", "balisahi", "ghatakula", "industrial estate road", "government iti cuttack", "khapuriya sq", "link road", "nisamani talkies", "arundoya market", "pala mandap", "badambadi bus stand", "badambadi sq", "cnbt", "city college", "puri ghat police station", "cuttack sai temple", "high court road", "sishu bhavan", "judicial academy", "dagarpada road", "sati choura sq", "eye hospital sq", "windsor palace", "markatnagar cda 7", "cda government hospital", "ipsar", "cesu or cda 9 road", "icai bhavan", "tonpe road", "justice sq", "state bank sq", "biju patnaik park", "madhusudan bridge sq", "nuapatna road", "dhabaleswar temple road", "dhabaleswar"]
  },
  {
    route: "84",
    start: "Biju Patnaik Park, CDA",
    destination: "Madhabananda Temple, Niali",
    stops: "biju patnaik park, state bank sq 1, justice square 1, saraswati sishu mandir, rajkisor marg, cda 9 market sq, cda 6 park, eye hospital sq, satichoura sq, dabarpada road, judicial academy, sishu bhavan, high court road, cuttack sai temple, puri ghat police station, city college, khan nagar traffic, cnbt, badambadi sq, badambadi bus stand, pala mandap, arundoya market, nisamani talkies, link road, khapuriya sq, gopalpur railway station, balikuda, bhanpur, pratapnagari, deltagada, telengapentha, bamphakuda, nakhara sq, dps kalinga, kharagala estate, synergy college, midland height, jaypur road, east college, trinath bajar, panchaghati bajar, bateswar mahadev temple, bhavani nagar phase 2, bramhani jharilo, police aid bramhani jharilo, kuranga, sudhananda college, ocean water park, snowman logistics, badajharilo, sundargram, dadichi group, bagalpur panchayat office, dakineswar mahadev temple, jharpada road, kantapada, pwd dakabangla kantapada, olatpur, SVNIRTAR olatpur, olatpur, sisua, ichhapur, barahipur, adaspur hospital, udaynath college, salei, kaliaghai market, rk institute, apuja, nua gaon, niali college, majhi khanda chaka, bank chaka niali, niali high school, niali police station, fire station station, jalaharpur, tolagopinathpur, panimala, madhav gp, madhaba nanda high school, madhaba nanda temple",
    stopsList: ["biju patnaik park", "state bank sq 1", "justice square 1", "saraswati sishu mandir", "rajkisor marg", "cda 9 market sq", "cda 6 park", "eye hospital sq", "satichoura sq", "dabarpada road", "judicial academy", "sishu bhavan", "high court road", "cuttack sai temple", "puri ghat police station", "city college", "khan nagar traffic", "cnbt", "badambadi sq", "badambadi bus stand", "pala mandap", "arundoya market", "nisamani talkies", "link road", "khapuriya sq", "gopalpur railway station", "balikuda", "bhanpur", "pratapnagari", "deltagada", "telengapentha", "bamphakuda", "nakhara sq", "dps kalinga", "kharagala estate", "synergy college", "midland height", "jaypur road", "east college", "trinath bajar", "panchaghati bajar", "bateswar mahadev temple", "bhavani nagar phase 2", "bramhani jharilo", "police aid bramhani jharilo", "kuranga", "sudhananda college", "ocean water park", "snowman logistics", "badajharilo", "sundargram", "dadichi group", "bagalpur panchayat office", "dakineswar mahadev temple", "jharpada road", "kantapada", "pwd dakabangla kantapada", "olatpur", "SVNIRTAR olatpur", "olatpur", "sisua", "ichhapur", "barahipur", "adaspur hospital", "udaynath college", "salei", "kaliaghai market", "rk institute", "apuja", "nua gaon", "niali college", "majhi khanda chaka", "bank chaka niali", "niali high school", "niali police station", "fire station station", "jalaharpur", "tolagopinathpur", "panimala", "madhav gp", "madhaba nanda high school", "madhaba nanda temple"]
  },
  {
    route: "85",
    start: "Cuttack Netaji Bus Terminal",
    destination: "Gadama",
    stops: "cnbt, khan nagar traffic, badambadi sq, badambadi bus stand, pala mandap, arundoya market, nisamani talkies, link road, samrat cinema, omp sq, officers colony cuttack, 6th battalion, chauliaganj durga mandap, madan mohan market, nayabazar, bidyadharpur, ganesh bazar bidyadharpur, nrri main gate, keshavdham road, gati rout patna, mathasahi road, biribati, nahabanga, khetrabasi iti fakirpada, fakirpada, kespur, kandarpur, alarpur, xaviers college of hotel management, kamarpada, archhili, ram kumar pur, sompur, talapada, nanpur, ananta balia nursery, gadama",
    stopsList: ["cnbt", "khan nagar traffic", "badambadi sq", "badambadi bus stand", "pala mandap", "arundoya market", "nisamani talkies", "link road", "samrat cinema", "omp sq", "officers colony cuttack", "6th battalion", "chauliaganj durga mandap", "madan mohan market", "nayabazar", "bidyadharpur", "ganesh bazar bidyadharpur", "nrri main gate", "keshavdham road", "gati rout patna", "mathasahi road", "biribati", "nahabanga", "khetrabasi iti fakirpada", "fakirpada", "kespur", "kandarpur", "alarpur", "xaviers college of hotel management", "kamarpada", "archhili", "ram kumar pur", "sompur", "talapada", "nanpur", "ananta balia nursery", "gadama"]
  },
  {
    route: "86",
    start: "MANU University",
    destination: "Mahanadi Vihar",
    stops: "Driems, tangi, saranpur road, sapanpur road, odisha adarsha vidyalaya kandarkana, karanji, harianta, nergundi, manguli, nuntikiri, mundamala chaka, otm labor colony, otm staff colony, gandhi chaka, municipality office choudwar, kali mandir choudwar, birupa anicut, birupa vihar square, laxmanpur, sai sports authority of India, pandasahi road, sikharipur, jobra anicut, settlement office, scb medical, balaji hospital, revenshaw university, cuttack railway station, omp square, samrat cinema, link road, nisamani talkies, arundoya market, pala mandap, badambadi bus stand, cnbt, city college, puri ghat police station, cuttack sai temple, high court road, sishu bhavan, judicial academy, dabarpada road, sati choura square, eye hospital square, cda 6 park, cda 9 market square, cda sector 9",
    stopsList: ["Driems", "tangi", "saranpur road", "sapanpur road", "odisha adarsha vidyalaya kandarkana", "karanji", "harianta", "nergundi", "manguli", "nuntikiri", "mundamala chaka", "otm labor colony", "otm staff colony", "gandhi chaka", "municipality office choudwar", "kali mandir choudwar", "birupa anicut", "birupa vihar square", "laxmanpur", "sai sports authority of India", "pandasahi road", "sikharipur", "jobra anicut", "settlement office", "scb medical", "balaji hospital", "revenshaw university", "cuttack railway station", "omp square", "samrat cinema", "link road", "nisamani talkies", "arundoya market", "pala mandap", "badambadi bus stand", "cnbt", "city college", "puri ghat police station", "cuttack sai temple", "high court road", "sishu bhavan", "judicial academy", "dabarpada road", "sati choura square", "eye hospital square", "cda 6 park", "cda 9 market square", "cda sector 9"]
  },
  {
    route: "87",
    start: "Naraj Police Outpost",
    destination: "Mahanadi Vihar",
    stops: "biju patnaik park, state bank sq 1, justice sq 1, tonpe road, icia bavan, cesu or cda 9 road, ipsar, cda government hospital, markatnagar cda 7, cda sector 6 road, abit, judicial academy, sisubhavan, high court road, cuttack ssai temple, puri ghat police station, city college, khan nagar traffic, cnbt, badambadi sq, badambadi bus stand, pala mandap, arndaya market, nisa mani talkies, link road, samrat cinema, omp sq, officers colony cuttack, 6th battalion, chaulia ganj durga mandap, madan mohan market, naya bazar, bdo office cuttack sadar, chaulia ganj police outpost, mahanadi vihar",
    stopsList: ["biju patnaik park", "state bank sq 1", "justice sq 1", "tonpe road", "icia bavan", "cesu or cda 9 road", "ipsar", "cda government hospital", "markatnagar cda 7", "cda sector 6 road", "abit", "judicial academy", "sisubhavan", "high court road", "cuttack ssai temple", "puri ghat police station", "city college", "khan nagar traffic", "cnbt", "badambadi sq", "badambadi bus stand", "pala mandap", "arndaya market", "nisa mani talkies", "link road", "samrat cinema", "omp sq", "officers colony cuttack", "6th battalion", "chaulia ganj durga mandap", "madan mohan market", "naya bazar", "bdo office cuttack sadar", "chaulia ganj police outpost", "mahanadi vihar"]
  },
  {
    route: "88",
    start: "NLU",
    destination: "SCB Hospital",
    stops: "settlement office, scb, clock tower, revenshaw uni, pilgrim road, malgodown, chatra bazar, professor pada, bajrakbati, dwarka hotel, dolomundei sq, badambadi sq, cnbt, city college, puri ghat police station, cuttack sai temple, high court road, sisu bhavan, judicial academy, dagarpada road, sati choura sq, eye hospital sq, cda 6 park, cda 9 market sq, rajkishor marg, Saraswati sisu mandir, justice sq, state bank sq, biju patnaik sq, state bank sq 1, justic sq, biren mitra park, cda sector 10, cda sector 11, netaji subhas chak cuttack, cda sector 13, cda sector 13 road 1, revenshaw uni mahanadi campus, nluo",
    stopsList: ["settlement office", "scb", "clock tower", "revenshaw uni", "pilgrim road", "malgodown", "chatra bazar", "professor pada", "bajrakbati", "dwarka hotel", "dolomundei sq", "badambadi sq", "cnbt", "city college", "puri ghat police station", "cuttack sai temple", "high court road", "sisu bhavan", "judicial academy", "dagarpada road", "sati choura sq", "eye hospital sq", "cda 6 park", "cda 9 market sq", "rajkishor marg", "Saraswati sisu mandir", "justice sq", "state bank sq", "biju patnaik sq", "state bank sq 1", "justic sq", "biren mitra park", "cda sector 10", "cda sector 11", "netaji subhas chak cuttack", "cda sector 13", "cda sector 13 road 1", "revenshaw uni mahanadi campus", "nluo"]
  },
  {
    route: "89",
    start: "Trishulia Bus Stand",
    destination: "Jagadguru Krupalu University",
    stops: "settlement office, scb meidcal, balaji hospital, clock tower, revenshaw uni, cuttack railway station, omp sq, samrat cinema, link road, nishamani talkies, arundoya market, pala mandap, badambadi bus stand, cnbt, city college, puri ghat police stayion, cuttack sai temple, high court road sisu bhavan, judicial academy, kanhei pada, trisulia swq, mundamuhan sq, fakir pada, presidency resorts, patapur, pajma lava nagar, hanuman temple sandhapur, bidyadharpur, sandhapur, sandhpur hwc, sri sri uni gate no. 1, omfed dairy, sri sri gate no 1, netal, odisha adarsh vidyalya arilo, godi sahi, bharat masala, sai international school, 3bn ndrf, govind pur chaka, jnv, govindpur chaka, nigam institute, ramchandi bazar, jagatguru krupalu university",
    stopsList: ["settlement office", "scb meidcal", "balaji hospital", "clock tower", "revenshaw uni", "cuttack railway station", "omp sq", "samrat cinema", "link road", "nishamani talkies", "arundoya market", "pala mandap", "badambadi bus stand", "cnbt", "city college", "puri ghat police stayion", "cuttack sai temple", "high court road sisu bhavan", "judicial academy", "kanhei pada", "trisulia swq", "mundamuhan sq", "fakir pada", "presidency resorts", "patapur", "pajma lava nagar", "hanuman temple sandhapur", "bidyadharpur", "sandhapur", "sandhpur hwc", "sri sri uni gate no. 1", "omfed dairy", "sri sri gate no 1", "netal", "odisha adarsh vidyalya arilo", "godi sahi", "bharat masala", "sai international school", "3bn ndrf", "govind pur chaka", "jnv", "govindpur chaka", "nigam institute", "ramchandi bazar", "jagatguru krupalu university"]
  },
  {
    route: "90",
    start: "Khordha New Bus Stand",
    destination: "Jagatpur, Cuttack",
    stops: "jagatpur, shikharpur, gandapur omp sq, link road, khapuria sq, gopal pur railway station, bali poda, bhanpur, pratap nagri, delta gada, telenga pentha, bamphakuda, nakhra sq, apex college, pahal, millenium city, ulkal heights, high way honda, puri canal road, hanspal sq, hi tech hospital sq, satpathi temple, palasuni, rasulgarh sq, satsang vihar, vani vuhar, acharya vihar, immt, jaydev vihar, nabar, iskon tenple, crfp sq, fire station, rajdhani college, baramunda bsabt, khandagiri bypass, khandagiri sq, kolathia1, aiginia 1, alu godam, patra poda 1, k9, kalinga vuhar sq, tamando, bijipur, aditya hyundai tamando, gohiria sq, retanga road sq, janla post office, janla medical, ogalapada, bhuasuni temple, jatani gate, gangalada, jupitar college gangapada, pitapali sq, pitapali petrol pump, khorda bypass sq, pn college, uphc, baruni pitha, gada khorda, drda old collector office, palahata sq, khorda new bus stand",
    stopsList: ["jagatpur", "shikharpur", "gandapur omp sq", "link road", "khapuria sq", "gopal pur railway station", "bali poda", "bhanpur", "pratap nagri", "delta gada", "telenga pentha", "bamphakuda", "nakhra sq", "apex college", "pahal", "millenium city", "ulkal heights", "high way honda", "puri canal road", "hanspal sq", "hi tech hospital sq", "satpathi temple", "palasuni", "rasulgarh sq", "satsang vihar", "vani vuhar", "acharya vihar", "immt", "jaydev vihar", "nabar", "iskon tenple", "crfp sq", "fire station", "rajdhani college", "baramunda bsabt", "khandagiri bypass", "khandagiri sq", "kolathia1", "aiginia 1", "alu godam", "patra poda 1", "k9", "kalinga vuhar sq", "tamando", "bijipur", "aditya hyundai tamando", "gohiria sq", "retanga road sq", "janla post office", "janla medical", "ogalapada", "bhuasuni temple", "jatani gate", "gangalada", "jupitar college gangapada", "pitapali sq", "pitapali petrol pump", "khorda bypass sq", "pn college", "uphc", "baruni pitha", "gada khorda", "drda old collector office", "palahata sq", "khorda new bus stand"]
  },
  {
    route: "91",
    start: "Baramunda BSABT",
    destination: "Biju Patnaik Park, Cuttack",
    stops: "biju patnaik park, state bank sq 1, justice sq 1, saraswati sishu mandir, raj kishor marg, cesu or cda 9 road, ipsar, cda government hospital, markatnagar cda 7, windsor palace, eye hospital sq, sati choura sq, dagarpada road, judicial academy, sishu bhawan, high court road, cuttack sai temple, puri ghar police station, city college, cnbt, badambadi sq, badambadi bus stand, pala mandap, arundoya market, nishamani talkies, link road, khanpuria sq, gopalpur railway station, balikuda, bhanpur, jyotsna vihar, oratap nagari, delta gada, telenga pentha, bamphakuda, nakhara sq, sum hospital campus2, apex college, pahal, millenium city, utkal heights, vishnu vihar, highway honda, puri canal road, hanspal square, hi tech hospital square, saptasai temple, palasuni, rasulgarsh sq, vss nagar riad, satsang vuhar, vani vihar sq, vani vihar, acharya vihar sq, immt, jaydev vihar sq, nabad, iskon temple, nayapali crpf sq, gapabandhi nagar, fire station, rajdhani college, baramunda bsabt",
    stopsList: ["biju patnaik park", "state bank sq 1", "justice sq 1", "saraswati sishu mandir", "raj kishor marg", "cesu or cda 9 road", "ipsar", "cda government hospital", "markatnagar cda 7", "windsor palace", "eye hospital sq", "sati choura sq", "dagarpada road", "judicial academy", "sishu bhawan", "high court road", "cuttack sai temple", "puri ghar police station", "city college", "cnbt", "badambadi sq", "badambadi bus stand", "pala mandap", "arundoya market", "nishamani talkies", "link road", "khanpuria sq", "gopalpur railway station", "balikuda", "bhanpur", "jyotsna vihar", "oratap nagari", "delta gada", "telenga pentha", "bamphakuda", "nakhara sq", "sum hospital campus2", "apex college", "pahal", "millenium city", "utkal heights", "vishnu vihar", "highway honda", "puri canal road", "hanspal square", "hi tech hospital square", "saptasai temple", "palasuni", "rasulgarsh sq", "vss nagar riad", "satsang vuhar", "vani vihar sq", "vani vihar", "acharya vihar sq", "immt", "jaydev vihar sq", "nabad", "iskon temple", "nayapali crpf sq", "gapabandhi nagar", "fire station", "rajdhani college", "baramunda bsabt"]
  },
  {
    route: "92",
    start: "Baramunda BSABT",
    destination: "Sai Temple",
    stops: "sum hospital, shaympur, ayurveda college, kalinga studio sw, agriculture directorate, jagannath vihar, rental colony, crpf kv, fire station sq, rajdhani college, baramunda bsabt, khandagiri bypass, khandagiri sq, Jagannath temple, jagamara iter college, gandamunda, kalabhoomi, madhusudhan park, housing board colony, pokhari put, sundarpada hata, lingaraj station, ekmara college, bhumatangi, poonam flyover, palaspalli, naveen nivas, oil airport sq, new airport sq, capital hospital, ag square, unt 1 haat, rah mahal square, kalpana sqauare, state museum, bjb college, ncc canteen, shree hospital, ravi talkies, raja rani temple, chili pokhari, ratnakar bagh, brashneswarpatna, megheswar temple, sai mandir",
    stopsList: ["sum hospital", "shaympur", "ayurveda college", "kalinga studio sw", "agriculture directorate", "jagannath vihar", "rental colony", "crpf kv", "fire station sq", "rajdhani college", "baramunda bsabt", "khandagiri bypass", "khandagiri sq", "Jagannath temple", "jagamara iter college", "gandamunda", "kalabhoomi", "madhusudhan park", "housing board colony", "pokhari put", "sundarpada hata", "lingaraj station", "ekmara college", "bhumatangi", "poonam flyover", "palaspalli", "naveen nivas", "oil airport sq", "new airport sq", "capital hospital", "ag square", "unt 1 haat", "rah mahal square", "kalpana sqauare", "state museum", "bjb college", "ncc canteen", "shree hospital", "ravi talkies", "raja rani temple", "chili pokhari", "ratnakar bagh", "brashneswarpatna", "megheswar temple", "sai mandir"]
  },
  {
    route: "93",
    start: "Bhubaneswar Railway Station",
    destination: "Biju Patnaik Park, CDA",
    stops: "state bank sq1, justice square 1, saraswati sishu mandir, raj kishor matg, cda 9 market sq, cda 6 park, eye hos, sati choura square, dagarpada road, judicial academy, kunheipara, teisulia square, mandakini resort, madhuban, bachhipur, barang police station, barang sq, barang sitaram bazar, jungle view, orissa diesel, bhalunka road, jujhagada, daruthenga school, darthenga, shyamsundarpur, sog, chandaka college, chandaka, chandaka market, nalanda institute of technology, kujimahal square, dalua sq, asbm bhola sq, godibari village, godbari nature camp, sparsh hospital, kantabada bazar, kateni, ablaze komz, ghangapatna sq, tarini temple ghangapatna, roti, paikarapur road, iiit sq, gothapatna sq, ri paikarapur, malipada, nuagoan sq, sum hospital, shyampur, ayurveda college, kalinga studio sq, agriculture directorate, Jagannath vihar, rental colony, crpf kv, fire station sq, vivekananda hospital, delta sq, satabdi nagar, city womens college, ouat sq, siripur market, gopabandhu sq, surya nagar, gobernir house sq, Bhubaneswar club, ag sq, unit 1 haat, raj mahal sq, ashok nagar, master canteen",
    stopsList: ["state bank sq1", "justice square 1", "saraswati sishu mandir", "raj kishor matg", "cda 9 market sq", "cda 6 park", "eye hos", "sati choura square", "dagarpada road", "judicial academy", "kunheipara", "teisulia square", "mandakini resort", "madhuban", "bachhipur", "barang police station", "barang sq", "barang sitaram bazar", "jungle view", "orissa diesel", "bhalunka road", "jujhagada", "daruthenga school", "darthenga", "shyamsundarpur", "sog", "chandaka college", "chandaka", "chandaka market", "nalanda institute of technology", "kujimahal square", "dalua sq", "asbm bhola sq", "godibari village", "godbari nature camp", "sparsh hospital", "kantabada bazar", "kateni", "ablaze komz", "ghangapatna sq", "tarini temple ghangapatna", "roti", "paikarapur road", "iiit sq", "gothapatna sq", "ri paikarapur", "malipada", "nuagoan sq", "sum hospital", "shyampur", "ayurveda college", "kalinga studio sq", "agriculture directorate", "Jagannath vihar", "rental colony", "crpf kv", "fire station sq", "vivekananda hospital", "delta sq", "satabdi nagar", "city womens college", "ouat sq", "siripur market", "gopabandhu sq", "surya nagar", "gobernir house sq", "Bhubaneswar club", "ag sq", "unit 1 haat", "raj mahal sq", "ashok nagar", "master canteen"]
  },
  {
    route: "94",
    start: "Jatani (SIEP)",
    destination: "Baramunda BSABT",
    stops: "siep jatni, pwd or iti jatni, jagannathpur, bachhara melan padia, bachhara, jatani police station 1, sitaram chowk, khorda road station, sitaram chowk1, jatani police station1, mahulgudia sq 1, jatani municipal council1, haribhaina sq, sophitorium, community health center jatani, prananath government high school, jatani college, centurion university of technology and management, sandhapur, kanark institute of science and technology, royal habitat, gobindapur, jatani gate, bhuasuni temple, ogalapada, janka medical, janla post office, retang road square, gohiria sq, aditya hyundai temple, bijipur, tamando, kalinga vihar square, k9, patrapda 1, alu godam1, aiginia1 kolathia, khandagiri sq, khandagiri bypass, baramunda bsabt",
    stopsList: ["siep jatni", "pwd or iti jatni", "jagannathpur", "bachhara melan padia", "bachhara", "jatani police station 1", "sitaram chowk", "khorda road station", "sitaram chowk1", "jatani police station1", "mahulgudia sq 1", "jatani municipal council1", "haribhaina sq", "sophitorium", "community health center jatani", "prananath government high school", "jatani college", "centurion university of technology and management", "sandhapur", "kanark institute of science and technology", "royal habitat", "gobindapur", "jatani gate", "bhuasuni temple", "ogalapada", "janka medical", "janla post office", "retang road square", "gohiria sq", "aditya hyundai temple", "bijipur", "tamando", "kalinga vihar square", "k9", "patrapda 1", "alu godam1", "aiginia1 kolathia", "khandagiri sq", "khandagiri bypass", "baramunda bsabt"]
  }
];

// Approximate coordinates for known major transit stops
export const STOP_COORDINATES_MAP: Record<string, [number, number]> = {
  "master canteen": [20.2668, 85.8436],
  "master canteen janpath": [20.2668, 85.8436],
  "bhubaneswar railway station": [20.2668, 85.8436],
  "sriya square": [20.2740, 85.8430],
  "ram mandir": [20.2790, 85.8420],
  "satya nagar": [20.2820, 85.8435],
  "satya nagar sq": [20.2820, 85.8435],
  "maharshi college": [20.2880, 85.8410],
  "rupali square": [20.2920, 85.8400],
  "rd women college": [20.2925, 85.8390],
  "vani vihar": [20.3015, 85.8365],
  "acharya vihar": [20.3055, 85.8285],
  "acharya vihar sq": [20.3055, 85.8285],
  "acharay vihar square": [20.3055, 85.8285],
  "immt": [20.3030, 85.8230],
  "jaydev vihar": [20.3039, 85.8188],
  "jaydev vihar square": [20.3039, 85.8188],
  "jayedev vihar square": [20.3039, 85.8188],
  "pal heights": [20.3045, 85.8175],
  "pal height": [20.3045, 85.8175],
  "mayfair road": [20.3060, 85.8160],
  "may fair road": [20.3060, 85.8160],
  "janta maidan": [20.3090, 85.8170],
  "xavier square": [20.3150, 85.8190],
  "xavior square": [20.3150, 85.8190],
  "fortune tower": [20.3180, 85.8200],
  "rail sadan": [20.3270, 85.8210],
  "omfed": [20.3310, 85.8205],
  "salishree vihar": [20.3420, 85.8110],
  "shailashree vihar": [20.3420, 85.8110],
  "kiit": [20.3533, 85.8164],
  "sikhar chandi": [20.3610, 85.8150],
  "nandankanan": [20.3950, 85.8280],
  "nandan kannan": [20.3950, 85.8280],
  "barang": [20.4050, 85.8300],
  "trisulia": [20.4200, 85.8450],
  "trisulia sq": [20.4200, 85.8450],

  "trishulia sq": [20.4200, 85.8450],
  "judicial academy": [20.4400, 85.8550],
  "satichaura sq": [20.4500, 85.8600],
  "cda 6 park": [20.4550, 85.8450],
  "cda 9 market sq": [20.4600, 85.8400],
  "biju patnaik park": [20.4650, 85.8350],
  "bijupatnaik park": [20.4650, 85.8350],
  "badambadi": [20.4578, 85.8732],
  "badambadi bus stand": [20.4578, 85.8732],
  "cnbt": [20.4578, 85.8732],
  "link road": [20.4650, 85.8850],
  "omp sq": [20.4700, 85.8950],
  "omp square": [20.4700, 85.8950],
  "scb medical": [20.4750, 85.8800],
  "scb": [20.4750, 85.8800],
  "cuttack railway station": [20.4650, 85.8900],
  "barabati stadium": [20.4850, 85.8700],
  "jagatpur": [20.5100, 85.9100],
  "salepur": [20.5500, 85.9800],
  "dhabaleswar": [20.5150, 85.8250],
  "kandarpur": [20.4500, 85.9600],
  "nluo": [20.4480, 85.8200],
  "naraj": [20.4300, 85.7900],
  "naraj barrage": [20.4300, 85.7900],
  "sri sri university": [20.4250, 85.7800],
  "baramunda": [20.2798, 85.7958],
  "baramunda bsabt": [20.2798, 85.7958],
  "baramndua bsbat": [20.2798, 85.7958],
  "rajdhani college": [20.2780, 85.8010],
  "fire station": [20.2770, 85.8060],
  "fire station sq": [20.2770, 85.8060],
  "gopabandhu nagar": [20.2820, 85.8080],
  "crpf sq": [20.2860, 85.8100],
  "nayapalli": [20.2982, 85.8105],
  "iskon temple": [20.2982, 85.8105],
  "khandagiri": [20.2588, 85.7865],
  "khandagiri sq": [20.2588, 85.7865],
  "khandagiri bypass": [20.2588, 85.7865],
  "kalinga vihar": [20.2450, 85.7600],
  "kalinga vihar sq": [20.2450, 85.7600],
  "patrapada": [20.2480, 85.7700],
  "aiims": [20.2312, 85.7761],
  "police academy": [20.2350, 85.7720],
  "sum hospital": [20.2760, 85.7580],
  "ouat": [20.2680, 85.8150],
  "ouat sq": [20.2680, 85.8150],
  "delta sq": [20.2720, 85.8110],
  "capital hospital": [20.2580, 85.8230],
  "ag square": [20.2650, 85.8280],
  "ag sq": [20.2650, 85.8280],
  "ag sqare": [20.2650, 85.8280],
  "new airport square": [20.2550, 85.8200],
  "new airport sq": [20.2550, 85.8200],
  "biju patnaik airport": [20.2524, 85.8178],
  "airport": [20.2524, 85.8178],
  "raj mahal sq": [20.2640, 85.8340],
  "raajmahal sq": [20.2640, 85.8340],
  "ashok nagar": [20.2660, 85.8390],
  "kalpana sq": [20.2570, 85.8420],
  "kalpana square": [20.2570, 85.8420],
  "state museum": [20.2550, 85.8420],
  "bjb college": [20.2520, 85.8430],
  "ravi talkies": [20.2450, 85.8460],
  "ravi takies": [20.2450, 85.8460],
  "lingaraj temple": [20.2385, 85.8335],
  "samantarapur": [20.2350, 85.8470],
  "nuagaon": [20.2280, 85.8490],
  "dhauli": [20.1920, 85.8390],
  "dhauli sq": [20.2100, 85.8500],
  "dhauli square": [20.2100, 85.8500],
  "uttara": [20.1980, 85.8550],
  "uttara sq": [20.1980, 85.8550],
  "uttara square": [20.1980, 85.8550],
  "pipili": [20.1150, 85.8330],
  "pipili bypass": [20.1200, 85.8350],
  "sakhigopal": [19.9500, 85.8250],
  "puri": [19.8135, 85.8312],
  "puri bus stand": [19.8242, 85.8456],
  "shree mandira": [19.8048, 85.8180],
  "shree mandir": [19.8048, 85.8180],
  "konark": [19.8876, 86.0945],
  "rasulgarh": [20.2977, 85.8643],
  "rasulgarh sq": [20.2977, 85.8643],
  "palasuni": [20.3115, 85.8620],
  "hanspal": [20.3180, 85.8750],
  "hanspal sq": [20.3180, 85.8750],
  "pahal": [20.3320, 85.8900],
  "nakhara": [20.3550, 85.9050],
  "nakhara sq": [20.3550, 85.9050],
  "royal lagoon": [20.3695, 85.8210],
  "royal lagoon apartments": [20.3695, 85.8210],
  "mani tribhuvan": [20.3640, 85.8215],
  "manitribhuban": [20.3640, 85.8215],
  "raghunathpur": [20.3720, 85.8230],
  "raghunathpur village": [20.3750, 85.8250],
  "nandan vihar": [20.3620, 85.8200],
  "sikharchandi": [20.3580, 85.8120],
  "sikharchandi vihar": [20.3600, 85.8150],
  "kimms hospital": [20.3560, 85.8140],
  "kims hospital": [20.3560, 85.8140],
  "kiit campus": [20.3540, 85.8180],
  "kiit sq": [20.3541, 85.8175],
  "kiit square": [20.3541, 85.8175],
  "patia": [20.3567, 85.8166],
  "patia sq": [20.3567, 85.8166],
  "patia square": [20.3567, 85.8166],
  "cipet": [20.3580, 85.8110],
  "infocity": [20.3602, 85.8035],
  "infocity square": [20.3602, 85.8035],
  "dlf": [20.3590, 85.8060],
  "dlf cybercity": [20.3590, 85.8060],
  "silicon": [20.3533, 85.8055],
  "trident college": [20.3582, 85.8086],
  "sai enclave": [20.3550, 85.8100],
  "kailash vihar": [20.3510, 85.8090],
  "niladri vihar": [20.3448, 85.8062],
  "niladri vihar sq": [20.3448, 85.8062],
  "care hospital": [20.3245, 85.8172],
  "kalinga hospital square": [20.3168, 85.8185],
  "jayadev vihar": [20.3039, 85.8188],
  "railway station": [20.2668, 85.8436],
  "khordha": [20.1820, 85.6200],
  "khordha new bus stand": [20.1820, 85.6200],
  "jatani": [20.1650, 85.7050],
  "jatani gate": [20.1700, 85.7100],
  "tamando": [20.2195, 85.7480],
  "pitapalli": [20.2050, 85.6800],
  "pitapalli sq": [20.2050, 85.6800]
};

/**
 * Given a stop name, finds or estimates [lat, lng]
 */
export function getStopCoordinates(stopName: string, routeStartCoord?: [number, number], routeEndCoord?: [number, number], stopIndex?: number, totalStops?: number): [number, number] {
  if (!stopName) return [20.2961, 85.8245];
  const clean = stopName.split(',')[0].toLowerCase().trim();
  const norm = clean.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
  
  // 1. Direct match in dictionary
  if (STOP_COORDINATES_MAP[norm]) {
    return STOP_COORDINATES_MAP[norm];
  }

  // 2. Partial match in dictionary
  for (const [key, coords] of Object.entries(STOP_COORDINATES_MAP)) {
    if (norm.includes(key) || key.includes(norm)) {
      return coords;
    }
  }

  // 3. Fallback interpolation between Start & End coordinates
  if (routeStartCoord && routeEndCoord && typeof stopIndex === 'number' && typeof totalStops === 'number' && totalStops > 1) {
    const fraction = stopIndex / (totalStops - 1);
    const lat = routeStartCoord[0] + (routeEndCoord[0] - routeStartCoord[0]) * fraction + (Math.sin(stopIndex) * 0.003);
    const lng = routeStartCoord[1] + (routeEndCoord[1] - routeStartCoord[1]) * fraction + (Math.cos(stopIndex) * 0.003);
    return [Math.round(lat * 10000) / 10000, Math.round(lng * 10000) / 10000];
  }

  // Master Canteen default
  return [20.2961, 85.8245];
}

/**
 * Returns all stops of a route with resolved coordinates for mapping
 */
export function getRouteStopsWithCoordinates(route: MoBusDetailRoute): Array<{
  name: string;
  lat: number;
  lng: number;
  index: number;
}> {
  const startCoord = getStopCoordinates(route.start);
  const destCoord = getStopCoordinates(route.destination);
  const total = route.stopsList.length;

  return route.stopsList.map((stopName, idx) => {
    const [lat, lng] = getStopCoordinates(stopName, startCoord, destCoord, idx, total);
    return {
      name: stopName.trim(),
      lat,
      lng,
      index: idx + 1,
    };
  });
}

// Area alias table for comprehensive Bhubaneswar, Cuttack, and Khordha corridor matching
const TRANSIT_AREA_ALIASES: Record<string, string[]> = {
  "cda": ["cda", "markatnagar", "markatanagar", "biju patnaik park", "sati chaura", "satichaura", "justice sq", "judicial academy", "cda 6 park", "cda 9 market sq", "cda sector 6", "cda sector 7", "cda sector 9", "cda sector 10", "cda sector 11", "cda sector 13", "cda 6", "cda 7", "cda 9", "cda 10", "cda 11", "cda 13"],
  "markatnagar": ["markatnagar", "markatanagar", "cda", "cda sector 6", "cda sector 7", "cda 7", "cda 6", "cda 9"],
  "kiit": ["kiit", "kiit sq", "kiit square", "kiit campus", "kiit university", "koel campus", "patia", "sikharchandi"],
  "patia": ["patia", "patia sq", "patia square", "kiit", "infocity", "dlf", "silicon", "trident", "cipet"],
  "trident": ["trident college", "trident", "infocity", "cipet", "patia", "silicon"],
  "royal lagoon": ["royal lagoon", "royal lagoon apartments", "raghunathpur", "mani tribhuvan", "nandan vihar", "sikharchandi vihar"],
  "airport": ["biju patnaik", "airport", "new airport", "capital hospital", "ag sq", "ag square"],
  "railway station": ["master canteen", "bhubaneswar railway station", "railway station", "janpath", "sriya sq", "ram mandir", "station"],
  "master canteen": ["master canteen", "master canteen janpath", "bhubaneswar railway station", "sriya sq", "ram mandir", "janpath"],
  "baramunda": ["baramunda", "baramunda bsabt", "bsabt", "rajdhani college", "fire station", "crpf"],
  "cuttack": ["badambadi", "cnbt", "link road", "omp sq", "scb medical", "cuttack railway station", "cda"],
  "badambadi": ["badambadi", "cnbt", "link road", "pala mandap", "cuttack railway station"],
  "sum": ["sum hospital", "sum ultimate", "k8 dream palace", "nuagoan", "malipada", "ghangapatna"],
  "aiims": ["aiims", "patrapada", "khandagiri", "kalinga vihar"],
  "khandagiri": ["khandagiri", "khandagiri sq", "khandagiri bypass", "baramunda", "aiims", "patrapada"],
  "jaydev vihar": ["jaydev vihar", "jayadev vihar", "pal heights", "pal height", "mayfair", "janta maidan", "xavier square"],
  "acharya vihar": ["acharya vihar", "acharyavihar", "acharay vihar", "immt", "vani vihar", "satsang vihar"],
  "puri": ["puri", "puri bus stand", "shree mandir", "shree mandira", "sakhigopal", "pipili", "uttara", "dhauli"],
  "nandankanan": ["nandankanan", "nandan kannan", "nandan kannana", "barang", "raghunathpur", "nandan vihar"],
};

function expandSearchTokens(query: string): string[] {
  if (!query) return [];
  const normalized = query.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ").trim();
  const words = normalized.split(/\s+/).filter(Boolean);
  const tokenSet = new Set<string>([normalized, ...words]);

  for (const [key, aliases] of Object.entries(TRANSIT_AREA_ALIASES)) {
    if (normalized.includes(key) || words.some(w => key.includes(w) || w.includes(key))) {
      aliases.forEach(a => tokenSet.add(a));
    }
  }

  return Array.from(tokenSet);
}

function findBestStopIndex(stopsClean: string[], startClean: string, destClean: string, tokens: string[]): number {
  for (let i = 0; i < stopsClean.length; i++) {
    const s = stopsClean[i];
    for (const t of tokens) {
      if (s === t || s.includes(t) || t.includes(s)) {
        return i;
      }
    }
  }

  // Check start and dest
  for (const t of tokens) {
    if (startClean === t || startClean.includes(t) || t.includes(startClean)) return 0;
    if (destClean === t || destClean.includes(t) || t.includes(destClean)) return stopsClean.length - 1;
  }

  return -1;
}

/**
 * Intelligent Dynamic Routing: Find matching Mo Bus routes between Any Origin and Any Destination
 */
export function findMoBusRoutesDynamic(originQuery: string, destQuery: string): {
  matchedRoutes: Array<{
    route: MoBusDetailRoute;
    fromStop: string;
    toStop: string;
    stopCount: number;
    subStops: string[];
    isDirect: boolean;
  }>;
  allRoutes: MoBusDetailRoute[];
} {
  const oTokens = expandSearchTokens(originQuery);
  const dTokens = expandSearchTokens(destQuery);

  if (oTokens.length === 0 && dTokens.length === 0) {
    return {
      matchedRoutes: [],
      allRoutes: MO_BUS_DETAILED_ROUTES,
    };
  }

  const directMatches: Array<{
    route: MoBusDetailRoute;
    fromStop: string;
    toStop: string;
    stopCount: number;
    subStops: string[];
    isDirect: boolean;
  }> = [];

  const partialMatches: Array<{
    route: MoBusDetailRoute;
    fromStop: string;
    toStop: string;
    stopCount: number;
    subStops: string[];
    isDirect: boolean;
  }> = [];

  for (const r of MO_BUS_DETAILED_ROUTES) {
    const stopsClean = r.stopsList.map(s => s.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ").trim());
    const startClean = r.start.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ").trim();
    const destClean = r.destination.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ").trim();

    const oIdx = oTokens.length > 0 ? findBestStopIndex(stopsClean, startClean, destClean, oTokens) : -1;
    const dIdx = dTokens.length > 0 ? findBestStopIndex(stopsClean, startClean, destClean, dTokens) : -1;

    if (oIdx !== -1 && dIdx !== -1) {
      const startI = Math.min(oIdx, dIdx);
      const endI = Math.max(oIdx, dIdx);
      const sub = r.stopsList.slice(startI, endI + 1);
      directMatches.push({
        route: r,
        fromStop: r.stopsList[oIdx] || r.start,
        toStop: r.stopsList[dIdx] || r.destination,
        stopCount: Math.max(2, sub.length),
        subStops: sub.length > 0 ? sub : [r.start, r.destination],
        isDirect: true,
      });
    } else if (oIdx !== -1) {
      const sub = r.stopsList.slice(oIdx);
      partialMatches.push({
        route: r,
        fromStop: r.stopsList[oIdx] || r.start,
        toStop: r.destination,
        stopCount: Math.max(2, sub.length),
        subStops: sub,
        isDirect: false,
      });
    } else if (dIdx !== -1) {
      const sub = r.stopsList.slice(0, dIdx + 1);
      partialMatches.push({
        route: r,
        fromStop: r.start,
        toStop: r.stopsList[dIdx] || r.destination,
        stopCount: Math.max(2, sub.length),
        subStops: sub,
        isDirect: false,
      });
    }
  }

  // Deduplicate by route number
  const seenRoutes = new Set<string>();
  const uniqueDirect: typeof directMatches = [];
  for (const m of directMatches) {
    if (!seenRoutes.has(m.route.route)) {
      seenRoutes.add(m.route.route);
      uniqueDirect.push(m);
    }
  }

  const uniquePartial: typeof partialMatches = [];
  for (const m of partialMatches) {
    if (!seenRoutes.has(m.route.route)) {
      seenRoutes.add(m.route.route);
      uniquePartial.push(m);
    }
  }

  const allMatches = [...uniqueDirect, ...uniquePartial];

  return {
    matchedRoutes: allMatches.length > 0 ? allMatches : MO_BUS_DETAILED_ROUTES.slice(0, 3).map(r => ({
      route: r,
      fromStop: r.start,
      toStop: r.destination,
      stopCount: r.stopsList.length,
      subStops: r.stopsList,
      isDirect: true,
    })),
    allRoutes: MO_BUS_DETAILED_ROUTES,
  };
}


