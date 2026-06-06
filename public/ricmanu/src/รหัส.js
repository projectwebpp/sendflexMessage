var accessToken = ''; // ตัวแปรนี้ไม่ได้ถูกใช้งานหาก getAccessTokenInternal() ถูกเรียกใช้
/*พัฒนาโดย:นายธีรพงศ์ พรหมวัง
ช่อง Youtube: ครบเครื่อง เรื่องไอที
// @AllaboutITAppScript
*/

/**
 * สร้างเมนูในชีตสำหรับจัดการ Trigger (วิธีเดียวที่ใช้ ScriptApp ได้)
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚙️ Rich Menu Manager')
    .addItem('▶ เปิดการตรวจสอบหมดอายุ (ทุก 1 นาที)', 'menuCreateExpiryTrigger')
    .addItem('⏹ หยุดการตรวจสอบหมดอายุ', 'menuDeleteExpiryTrigger')
    .addSeparator()
    .addItem('🔍 ตรวจสอบและดำเนินการหมดอายุทันที', 'checkAndExpireRichMenus')
    .addToUi();
}

function menuCreateExpiryTrigger() {
  var result = createExpiryTrigger();
  SpreadsheetApp.getUi().alert('Rich Menu Manager', result.message, SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuDeleteExpiryTrigger() {
  var result = deleteExpiryTrigger();
  SpreadsheetApp.getUi().alert('Rich Menu Manager', result.message, SpreadsheetApp.getUi().ButtonSet.OK);
}

function doGet() {
  // ตรวจสอบ expiry อัตโนมัติทุกครั้งที่เปิดหน้าเว็บ (ไม่ต้องใช้ ScriptApp)
  try { checkAndExpireRichMenus(); } catch (e) { console.error('auto-expiry on load:', e); }
  return HtmlService.createTemplateFromFile('index').evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle('ระบบจัดการริชเมนู')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
}

/**
 * ดึง access token จากแผ่น 'Setting'
 */
function getAccessTokenInternal() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Setting');
  if (!sheet) {
    throw new Error('ไม่พบแผ่นชื่อ "Setting" กรุณาสร้างและเพิ่ม Access Token ของคุณใน A2.');
  }

  // ดึงค่าทั้งหมดจากคอลัมน์ A เริ่มจากแถวที่ 2
  var accessTokenValues = sheet.getRange('A2:A').getValues();

  // อาร์เรย์สำหรับเก็บค่าที่ไม่ว่าง
  var nonEmptyTokens = [];

  // วนลูปผ่านแต่ละค่าและเก็บค่าที่ไม่ว่าง
  for (var i = 0; i < accessTokenValues.length; i++) {
    var accessTokenValue = accessTokenValues[i][0];
    if (accessTokenValue && accessTokenValue.toString().trim() !== '') {
      nonEmptyTokens.push(accessTokenValue.toString().trim());
    }
  }

  // ส่งกลับอาร์เรย์ของค่าที่ไม่ว่าง
  return nonEmptyTokens;
}

/**
 * อัปเดตลำดับ Token โดยย้าย Token ที่เลือกไปด้านบนสุด
 */
function updateTokenOrderInSheet(selectedToken) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Setting');
  if (!sheet) {
    throw new Error('ไม่พบแผ่นชื่อ "Setting"');
  }

  // ดึงค่าทั้งหมดในคอลัมน์ A เริ่มจากแถวที่ 2
  const columnAValues = sheet.getRange('A2:A').getDisplayValues();
  const tokens = [];
  
  // เก็บค่า Token ที่ไม่ว่างทั้งหมด
  for (let i = 0; i < columnAValues.length; i++) {
    if (columnAValues[i][0] && columnAValues[i][0].toString().trim() !== '') {
      tokens.push(columnAValues[i][0].toString().trim());
    }
  }

  // ถ้าไม่มี Token ใน sheet
  if (tokens.length === 0) {
    // เพิ่ม Token ใหม่ในแถวที่ 2
    sheet.getRange(2, 1).setValue(selectedToken);
    return "เพิ่ม Token และย้ายไปด้านบนสำเร็จ";
  }

  // ค้นหา Token ในรายการ
  const tokenIndex = tokens.indexOf(selectedToken);
  
  if (tokenIndex === -1) {
    // Token ใหม่ ให้เพิ่มด้านบนสุด
    tokens.unshift(selectedToken);
  } else if (tokenIndex > 0) {
    // Token ที่มีอยู่แล้ว ให้ย้ายไปด้านบนสุด
    tokens.splice(tokenIndex, 1);
    tokens.unshift(selectedToken);
  } else {
    // Token อยู่ที่ด้านบนสุดอยู่แล้ว
    return "Token อยู่ที่ตำแหน่งบนสุดอยู่แล้ว";
  }

  // ล้างข้อมูลเดิม (เริ่มจากแถวที่ 2)
  sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).clear();
  
  // เขียน Token ใหม่เรียงจากบนลงล่าง
  for (let i = 0; i < tokens.length; i++) {
    sheet.getRange(i + 2, 1).setValue(tokens[i]);
  }

  return "อัปเดตลำดับ Token สำเร็จ";
}

/**
 * เพิ่ม Access Token ใหม่ (เพิ่มไปท้ายรายการ)
 */
function addNewAccessToken(newAccessToken) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName('Setting');

  // ถ้าไม่มีแผ่นนี้ ให้สร้างและตั้งค่าหัวข้อ
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Setting');
    sheet.getRange('A1').setValue('Channel Access Token');
  }

  // ดึงค่าทั้งหมดในคอลัมน์ A เริ่มจากแถวที่ 2
  var columnAValues = sheet.getRange('A2:A').getDisplayValues();
  
  // ตรวจสอบว่า token มีอยู่แล้วหรือไม่
  for (var i = 0; i < columnAValues.length; i++) {
    if (columnAValues[i][0] === newAccessToken) {
      // ถ้ามีอยู่แล้ว ให้ย้ายขึ้นด้านบน
      return updateTokenOrderInSheet(newAccessToken);
    }
  }

  // ถ้า token ไม่มีอยู่ ให้เพิ่มลงในแถวใหม่ (ด้านล่างสุด)
  var lastRow = sheet.getLastRow();
  var newRow = (lastRow === 1 && sheet.getRange('A2').getValue() === '') ? 2 : lastRow + 1;
  sheet.getRange(newRow, 1).setValue(newAccessToken);
  return 'เพิ่ม Access Token ใหม่สำเร็จ';
}

/**
 * ลบ access token
 */
function deleteAccessToken(token) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Setting');
  if (!sheet) {
    return "ไม่พบแผ่นชื่อ 'Setting'";
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return "ไม่มี Token ให้ลบ";
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  const tokens = [];
  
  // เก็บ Token ทั้งหมดยกเว้น Token ที่จะลบ
  for (let i = 0; i < data.length; i++) {
    const tokenValue = data[i][0];
    if (tokenValue && tokenValue !== token) {
      tokens.push(tokenValue);
    }
  }

  // ล้างข้อมูลเดิม
  if (lastRow >= 2) {
    sheet.getRange(2, 1, lastRow - 1, 1).clear();
  }
  
  // เขียน Token ใหม่
  for (let i = 0; i < tokens.length; i++) {
    sheet.getRange(i + 2, 1).setValue(tokens[i]);
  }

  return "ลบ Token สำเร็จ";
}

/**
 * ดึง access token จากแผ่น 'Setting' เพื่อแสดงผลฝั่งไคลเอนต์
 */
function getAccessToken() {
  try {
    const tokens = getAccessTokenInternal();
    return tokens || [];
  } catch (e) {
    console.log('ข้อผิดพลาดใน getAccessToken: ' + e.message);
    return [];
  }
}

/**
 * ฟังก์ชันสำหรับเลื่อน Token ขึ้น
 */
function moveTokenUp(index) {
  const tokens = getAccessTokenInternal();
  if (!tokens || index <= 0 || index >= tokens.length) {
    return tokens || [];
  }

  // สลับตำแหน่ง
  [tokens[index], tokens[index - 1]] = [tokens[index - 1], tokens[index]];
  
  // บันทึกลง sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Setting');
  if (sheet && tokens.length > 0) {
    sheet.getRange(2, 1, tokens.length, 1).setValues(tokens.map(t => [t]));
  }
  
  return tokens;
}

/**
 * ฟังก์ชันสำหรับเลื่อน Token ลง
 */
function moveTokenDown(index) {
  const tokens = getAccessTokenInternal();
  if (!tokens || index < 0 || index >= tokens.length - 1) {
    return tokens || [];
  }

  // สลับตำแหน่ง
  [tokens[index], tokens[index + 1]] = [tokens[index + 1], tokens[index]];
  
  // บันทึกลง sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Setting');
  if (sheet && tokens.length > 0) {
    sheet.getRange(2, 1, tokens.length, 1).setValues(tokens.map(t => [t]));
  }
  
  return tokens;
}

/**
 * ฟังก์ชันสำหรับย้าย Token ไปด้านบนสุด
 */
function moveTokenToTop(tokenToMove) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Setting');
  if (!sheet) {
    return [];
  }

  const tokens = getAccessTokenInternal();
  
  // ค้นหา Token ในรายการ
  const tokenIndex = tokens.indexOf(tokenToMove);
  
  if (tokenIndex === -1) {
    // Token ใหม่ ให้เพิ่มด้านบนสุด
    tokens.unshift(tokenToMove);
  } else if (tokenIndex > 0) {
    // Token ที่มีอยู่แล้ว ให้ย้ายไปด้านบนสุด
    const token = tokens.splice(tokenIndex, 1)[0];
    tokens.unshift(token);
  } else {
    // Token อยู่ที่ด้านบนสุดอยู่แล้ว
    return tokens;
  }

  // บันทึกลง sheet
  if (tokens.length > 0) {
    sheet.getRange(2, 1, tokens.length, 1).setValues(tokens.map(t => [t]));
  }
  
  return tokens;
}

/**
 * ดึงข้อมูลโปรไฟล์บอทจาก LINE API
 */
function getBotProfile() {
  var accessTokens = getAccessTokenInternal();
  if (!accessTokens || accessTokens.length === 0) {
    throw new Error('ไม่พบ Access Token กรุณาเพิ่ม Access Token ก่อน');
  }
  
  var accessToken = accessTokens[0]; // ใช้ token แรกในรายการ
  var url = 'https://api.line.me/v2/bot/info';
  var options = {
    'method': 'get',
    'headers': {
      'Authorization': 'Bearer ' + accessToken
    },
    'muteHttpExceptions': true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var responseData = JSON.parse(response.getContentText());
    console.log('ข้อมูลโปรไฟล์บอท: ' + JSON.stringify(responseData));
    return responseData;
  } catch (error) {
    console.log('ข้อผิดพลาดในการดึงโปรไฟล์บอท: ' + error);
    throw new Error('ข้อผิดพลาดในการดึงโปรไฟล์บอท: ' + error.message);
  }
}

/**
 * ดึงข้อมูลโปรไฟล์บอทตาม Token ที่ระบุ
 */
function getBotProfileByToken(token) {
  if (!token) return null;
  
  try {
    const url = 'https://api.line.me/v2/bot/info';
    const options = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    
    if (response.getResponseCode() === 200) {
      return JSON.parse(response.getContentText());
    } else {
      console.error('API Error:', response.getContentText());
      return null;
    }
  } catch (error) {
    console.error('Error in getBotProfileByToken:', error);
    return null;
  }
}

/**
 * สร้าง rich menu บนแพลตฟอร์ม LINE โดยใช้ JSON definition ที่ให้มา
 */
function createRichMenu(jsonRichMenu, token) {
  var options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    payload: jsonRichMenu,
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch('https://api.line.me/v2/bot/richmenu', options);
    var responseData = JSON.parse(response.getContentText());

    if (response.getResponseCode() === 200) {
      return responseData.richMenuId;
    } else {
      throw new Error(JSON.stringify(responseData));
    }
  } catch (error) {
    throw new Error('ข้อผิดพลาดในการสร้าง Rich Menu: ' + error.message);
  }
}

/**
 * ดึงข้อมูลเกี่ยวกับ rich menu ทั้งหมดที่เชื่อมโยงกับบอท
 */
function getRichMenuInfo() {
  var accessTokens = getAccessTokenInternal();
  if (!accessTokens || accessTokens.length === 0) {
    throw new Error('ไม่พบ Access Token กรุณาเพิ่ม Access Token ก่อน');
  }
  
  var accessToken = accessTokens[0];

  // ดึงรายการ rich menu
  var listUrl = 'https://api.line.me/v2/bot/richmenu/list';
  var options = {
    'method': 'get',
    'headers': {
      'Authorization': 'Bearer ' + accessToken
    },
    'muteHttpExceptions': true
  };

  try {
    var listResponse = UrlFetchApp.fetch(listUrl, options);
    var listResponseText = listResponse.getContentText();
    var listResponseCode = listResponse.getResponseCode();

    if (listResponseCode !== 200) {
      let errorMessage = `ข้อผิดพลาด HTTP ${listResponseCode}`;
      try {
        const errorData = JSON.parse(listResponseText);
        if (errorData.message) {
          errorMessage += `: ${errorData.message}`;
        }
      } catch (parseError) {
        errorMessage += `: ${listResponseText}`;
      }
      throw new Error(errorMessage);
    }

    var richMenus = JSON.parse(listResponseText).richmenus;

    // ดึง rich menu เริ่มต้น
    var defaultUrl = 'https://api.line.me/v2/bot/user/all/richmenu';
    var defaultResponse = UrlFetchApp.fetch(defaultUrl, options);
    var defaultResponseText = defaultResponse.getContentText();
    var defaultResponseCode = defaultResponse.getResponseCode();

    let defaultRichMenuId = '';
    if (defaultResponseCode === 200) {
      const defaultData = JSON.parse(defaultResponseText);
      defaultRichMenuId = defaultData.richMenuId || '';
    }

    // แปลง richMenus ให้ตรงกับโครงสร้างข้อมูลตัวอย่าง
    const formattedRichMenus = richMenus.map(menu => ({
      richMenuId: menu.richMenuId,
      name: menu.name || 'Unnamed Menu',
      size: menu.size || { width: 2500, height: 1686 },
      chatBarText: menu.chatBarText || 'Default Text',
      areas: menu.areas || [],
      selected: menu.selected || false
    }));

    return {
      richMenus: formattedRichMenus,
      defaultRichMenuId: defaultRichMenuId
    };

  } catch (error) {
    console.log('ข้อผิดพลาดในการดึงข้อมูล rich menu: ' + error);
    throw new Error('ข้อผิดพลาดในการดึงข้อมูล rich menu: ' + error.message);
  }
}

var forderid = '';

/**
 * อัปโหลดรูปภาพ rich menu ไปยังแพลตฟอร์ม LINE และบันทึกไปยัง Google Drive และ Sheet
 */
function uploadAndSaveRichMenuImage(richMenuId, base64Image, fileName) {
  var accessTokens = getAccessTokenInternal();
  if (!accessTokens || accessTokens.length === 0) {
    return { success: false, message: 'ไม่พบ Access Token' };
  }
  
  var accessToken = accessTokens[0];
  
  // ดึง folder id จาก cell B2
  try {
    const settingSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Setting');
    if (settingSheet) {
      forderid = settingSheet.getRange('B2').getValue();
    }
  } catch (e) {
    console.log('ไม่สามารถดึง folder id: ' + e.message);
  }

  const folderId = forderid || '';
  const richMenusSheetName = 'RichMenus';
  let folder = null;
  
  // ถ้ามี folder id ให้พยายามเข้าถึง folder
  if (folderId) {
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (e) {
      console.log('ไม่สามารถเข้าถึงโฟลเดอร์: ' + e.message);
    }
  }

  try {
    // ตัดส่วน header ของ base64 ออกถ้ามี
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    const decodedImage = Utilities.base64Decode(base64Data);
    
    let mimeType = MimeType.PNG;
    if (fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg')) {
      mimeType = MimeType.JPEG;
    }
    
    const blob = Utilities.newBlob(decodedImage, mimeType, fileName);
    
    // อัปโหลดไปยัง LINE
    var endpointUrl = `https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`;
    var options = {
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Content-Type": mimeType
      },
      "method": "post",
      "payload": blob.getBytes(),
      "muteHttpExceptions": true
    };

    var response = UrlFetchApp.fetch(endpointUrl, options);
    var responseText = response.getContentText();
    var responseCode = response.getResponseCode();

    if (responseCode === 200) {
      // บันทึกลง Google Drive ถ้ามี folder
      let driveFileUrl = '';
      if (folder) {
        try {
          const file = folder.createFile(blob);
          driveFileUrl = 'https://lh5.googleusercontent.com/d/' + file.getId();
        } catch (e) {
          console.log('ไม่สามารถบันทึกลง Drive: ' + e.message);
        }
      }
      
      // บันทึกลง Google Sheet
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(richMenusSheetName);
      if (!sheet) {
        sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(richMenusSheetName);
        sheet.getRange('A1:D1').setValues([['Rich Menu ID', 'Drive Image URL', 'Uploaded Date', 'LINE API Response']]);
      }
      sheet.appendRow([richMenuId, driveFileUrl || '', new Date(), 'Success']);
      
      return { 
        success: true, 
        message: 'อัปโหลดและบันทึกรูปภาพ Rich Menu สำเร็จ!',
        imageUrl: driveFileUrl ? "https://lh5.googleusercontent.com/d/" + driveFileUrl : ''
      };
    } else {
        let errorMessage = `ข้อผิดพลาด HTTP ${responseCode}`;
        try {
            const errorData = JSON.parse(responseText);
            if (errorData.message) {
                errorMessage += `: ${errorData.message}`;
            }
        } catch (parseError) {
            errorMessage += `: ${responseText}`;
        }
        throw new Error(errorMessage);
    }

  } catch (err) {
    console.log('ข้อผิดพลาดใน uploadAndSaveRichMenuImage: ' + err.message);
    return { success: false, message: 'ข้อผิดพลาดในการอัปโหลดรูปภาพ rich menu: ' + err.message };
  }
}

/**
 * ลบ rich menu เฉพาะ
 */
function deleteRichMenu(richMenuId) {
  var accessTokens = getAccessTokenInternal();
  if (!accessTokens || accessTokens.length === 0) {
    throw new Error('ไม่พบ Access Token');
  }
  
  var accessToken = accessTokens[0];

  var url = `https://api.line.me/v2/bot/richmenu/${richMenuId}`;

  var options = {
    'method': 'delete',
    'headers': {
      'Authorization': 'Bearer ' + accessToken
    },
    "muteHttpExceptions": true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var responseText = response.getContentText();
    var responseCode = response.getResponseCode();

    if (responseCode === 200) {
      return `ลบ Rich Menu ${richMenuId} สำเร็จ.`;
    } else {
        let errorMessage = `ข้อผิดพลาด HTTP ${responseCode}`;
        try {
            const errorData = JSON.parse(responseText);
            if (errorData.message) {
                errorMessage += `: ${errorData.message}`;
            }
        } catch (parseError) {
            errorMessage += `: ${responseText}`;
        }
        throw new Error(errorMessage);
    }
  } catch (error) {
    throw new Error(`ข้อผิดพลาดในการลบ Rich Menu ${richMenuId}: ` + error.message);
  }
}

/**
 * ตั้งค่า rich menu เฉพาะเป็นค่าเริ่มต้นสำหรับบอท
 */
function setDefaultRichMenu(richMenuId) {
  if (!richMenuId) {
    throw new Error("ไม่มี Rich Menu ID ที่ให้มาเพื่อตั้งเป็นค่าเริ่มต้น.");
  }

  var accessTokens = getAccessTokenInternal();
  if (!accessTokens || accessTokens.length === 0) {
    throw new Error('ไม่พบ Access Token');
  }
  
  var accessToken = accessTokens[0];

  var url = `https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`;

  var options = {
    'method': 'post',
    'headers': {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    'payload': JSON.stringify({}),
    "muteHttpExceptions": true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var responseText = response.getContentText();
    var responseCode = response.getResponseCode();

    if (responseCode === 200) {
      return `Rich Menu ${richMenuId} ได้ถูกตั้งเป็นค่าเริ่มต้นสำเร็จ.`;
    } else {
      let errorMessage = `ข้อผิดพลาด HTTP ${responseCode}`;
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.message) {
          errorMessage += `: ${errorData.message}`;
        }
      } catch (parseError) {
        errorMessage += `: ${responseText}`;
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    throw new Error(`ข้อผิดพลาดในการตั้งค่า Rich Menu ${richMenuId} เป็นค่าเริ่มต้น: ${error.message}`);
  }
}

/**
 * ดึงข้อมูล richMenuId และ URL รูปภาพจากชีต RichMenus
 */
function getRichMenuImagesFromSheet() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('RichMenus');
    if (!sheet) {
      return {};
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return {};
    }
    
    const range = sheet.getRange('A2:B' + lastRow);
    const values = range.getValues();

    const imageMap = {};
    values.forEach(row => {
      const richMenuId = row[0]?.toString().trim();
      const imageUrl = row[1]?.toString().trim();
      if (richMenuId && imageUrl) {
        imageMap[richMenuId] = imageUrl;
      }
    });

    return imageMap;
  } catch (error) {
    console.log('ข้อผิดพลาดในการดึงข้อมูลจากชีต: ' + error.message);
    return {};
  }
}

/**
 * ดึงรายการ Rich Menu Aliases ทั้งหมด
 */
function getAllRichMenuAliases() {
  var accessTokens = getAccessTokenInternal();
  if (!accessTokens || accessTokens.length === 0) {
    return { success: false, message: "LINE Channel Access Token ไม่ได้ถูกตั้งค่า" };
  }
  
  var accessToken = accessTokens[0];
  
  var endpointUrl = "https://api.line.me/v2/bot/richmenu/alias/list";
  var options = {
    headers: {
      "Authorization": "Bearer " + accessToken
    },
    "method": "get",
    "muteHttpExceptions": true
  };

  try {
    var response = UrlFetchApp.fetch(endpointUrl, options);
    var responseText = response.getContentText();
    var responseCode = response.getResponseCode();
    var data = responseText ? JSON.parse(responseText) : {};

    if (responseCode === 200) {
      return { success: true, aliases: data.aliases || [] };
    } else {
      return { success: false, message: `ข้อผิดพลาดในการดึง Alias (HTTP ${responseCode}): ${data.message || responseText}` };
    }
  } catch (err) {
    return { success: false, message: `เกิดข้อผิดพลาดในการดึง Alias: ${err.message}` };
  }
}

/**
 * ลบ Rich Menu Alias
 */
function deleteRichMenuAlias(aliasId) {
  var accessTokens = getAccessTokenInternal();
  if (!accessTokens || accessTokens.length === 0) {
    return { success: false, message: "LINE Channel Access Token ไม่ได้ถูกตั้งค่า" };
  }
  
  var accessToken = accessTokens[0];

  var endpointUrl = `https://api.line.me/v2/bot/richmenu/alias/${aliasId}`;
  var options = {
    headers: {
      "Authorization": "Bearer " + accessToken
    },
    "method": "delete",
    "muteHttpExceptions": true
  };

  try {
    var response = UrlFetchApp.fetch(endpointUrl, options);
    var responseText = response.getContentText();
    var responseCode = response.getResponseCode();

    if (responseCode === 200) {
      return { success: true, message: `ลบ Rich Menu Alias "${aliasId}" สำเร็จ!` };
    } else {
      var data = responseText ? JSON.parse(responseText) : {};
      return { success: false, message: `ข้อผิดพลาดในการลบ Alias (HTTP ${responseCode}): ${data.message || responseText || "ไม่ทราบข้อผิดพลาด"}` };
    }
  } catch (err) {
    return { success: false, message: `เกิดข้อผิดพลาดในการลบ Alias: ${err.message}` };
  }
}

/**
 * บันทึก JSON rich menu definition ไปยังแผ่น 'richMenu'
 */
function saveJsonRichMenu(jsonRichMenu) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('richMenu');
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('richMenu');
    sheet.getRange('A1').setValue('Rich Menu JSON');
  }
  sheet.getRange('A2').setValue(jsonRichMenu);
  return 'บันทึก JSON Rich Menu สำเร็จ';
}

/**
 * ดึง JSON rich menu definition จากแผ่น 'richMenu'
 */
function getJsonRichMenu() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('richMenu');
  if (!sheet) {
    return ''; 
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return '';
  }
  
  var jsonRichMenu = sheet.getRange('A2').getDisplayValue();
  return jsonRichMenu || '';
}

/**
 * สร้างหรืออัปเดต Rich Menu Alias
 */
function createOrUpdateRichMenuAlias(aliasName, richMenuId) {
  var accessTokens = getAccessTokenInternal();
  if (!accessTokens || accessTokens.length === 0) {
    return { success: false, message: "LINE Channel Access Token ไม่ได้ถูกตั้งค่า" };
  }
  
  var accessToken = accessTokens[0];

  var aliasObj = {
    "richMenuAliasId": "richmenu-alias-" + aliasName,
    "richMenuId": richMenuId
  };
  
  var endpointUrl = "https://api.line.me/v2/bot/richmenu/alias";
  var options = {
    headers: {
      "Authorization": "Bearer " + accessToken,
      "Content-Type": "application/json"
    },
    "method": "post",
    "payload": JSON.stringify(aliasObj),
    "muteHttpExceptions": true
  };

  try {
    var response = UrlFetchApp.fetch(endpointUrl, options);
    var responseText = response.getContentText();
    var responseCode = response.getResponseCode();
    var data = responseText ? JSON.parse(responseText) : {};

    if (responseCode === 200) {
      return { success: true, message: `สร้าง Rich Menu Alias "${aliasName}" ไปยัง Rich Menu ID "${richMenuId}" สำเร็จ!` };
    } else if (responseCode === 409) {
      // ลองอัปเดตแทน
      return updateRichMenuAlias(aliasName, richMenuId);
    } else {
      return { success: false, message: `ข้อผิดพลาดในการสร้าง Alias (HTTP ${responseCode}): ${data.message || responseText}` };
    }
  } catch (err) {
    return { success: false, message: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err.message}` };
  }
}

/**
 * อัปเดต Rich Menu Alias ที่มีอยู่
 */
function updateRichMenuAlias(aliasName, richMenuId) {
  var accessTokens = getAccessTokenInternal();
  if (!accessTokens || accessTokens.length === 0) {
    return { success: false, message: "LINE Channel Access Token ไม่ได้ถูกตั้งค่า" };
  }
  
  var accessToken = accessTokens[0];

  var aliasObj = {
    "richMenuId": richMenuId
  };
  
  var endpointUrl = `https://api.line.me/v2/bot/richmenu/alias/richmenu-alias-${aliasName}`;
  var options = {
    headers: {
      "Authorization": "Bearer " + accessToken,
      "Content-Type": "application/json"
    },
    "method": "put",
    "payload": JSON.stringify(aliasObj),
    "muteHttpExceptions": true
  };

  try {
    var response = UrlFetchApp.fetch(endpointUrl, options);
    var responseText = response.getContentText();
    var responseCode = response.getResponseCode();
    var data = responseText ? JSON.parse(responseText) : {};

    if (responseCode === 200) {
      return { success: true, message: `อัปเดต Rich Menu Alias "${aliasName}" ไปยัง Rich Menu ID "${richMenuId}" สำเร็จ!` };
    } else {
      return { success: false, message: `ข้อผิดพลาดในการอัปเดต Alias (HTTP ${responseCode}): ${data.message || responseText}` };
    }
  } catch (err) {
    return { success: false, message: `เกิดข้อผิดพลาดในการอัปเดต Alias: ${err.message}` };
  }
}

/**
 * ตั้งค่าให้ Uid แสดงริชเมนูตามที่ตั้งไว้
 */
function switchRichMenuForUser(userId, richMenuId) {
  if (!userId || !richMenuId) {
    return { success: false, message: "โปรดระบุ User ID และ Rich Menu ID" };
  }

  var accessTokens = getAccessTokenInternal();
  if (!accessTokens || accessTokens.length === 0) {
    return { success: false, message: 'ไม่พบ access token' };
  }
  
  var accessToken = accessTokens[0];

  var url = 'https://api.line.me/v2/bot/user/' + userId + '/richmenu/' + richMenuId;
  var options = {
    'method': 'post',
    'headers': {
      'Authorization': 'Bearer ' + accessToken
    },
    'muteHttpExceptions': true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();

    if (responseCode === 200) {
      console.log('สลับ Rich Menu สำเร็จ');
      return { success: true, message: `สลับ Rich Menu สำหรับผู้ใช้ ${userId} ไปยัง Rich Menu ID "${richMenuId}" สำเร็จ!` };
    } else {
      var errorMessage = `ข้อผิดพลาด HTTP ${responseCode}`;
      try {
        var errorData = JSON.parse(response.getContentText());
        if (errorData.message) {
          errorMessage += `: ${errorData.message}`;
        }
      } catch (parseError) {
        errorMessage += `: ${response.getContentText()}`;
      }
      console.log('ไม่สามารถสลับ Rich Menu ได้ รหัสการตอบสนอง: ' + responseCode);
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    console.log('ข้อผิดพลาดในการสลับ Rich Menu: ' + error);
    return { success: false, message: `ข้อผิดพลาดในการสลับ Rich Menu สำหรับผู้ใช้ ${userId}: ${error.message}` };
  }
}

/**
 * ดึงรายการผู้ใช้จากชีต "LINE User ID"
 */
function getUsersFromSheet() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('LINE User ID');
    
    if (!sheet) {
      console.log('ไม่พบชีตชื่อ "LINE User ID"');
      return [];
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      console.log('ไม่มีข้อมูลผู้ใช้ในชีต');
      return [];
    }

    // คาดหวังโครงสร้างคอลัมน์:
    // A: User ID, B: Display Name, C: Picture URL, D: Status Message, E: Timestamp
    const range = sheet.getRange('A2:E' + lastRow);
    const values = range.getValues();
    
    const users = [];
    
    values.forEach(row => {
      const userId = row[0]?.toString().trim();
      const displayName = row[1]?.toString().trim();
      const pictureUrl = row[2]?.toString().trim();
      const statusMessage = row[3]?.toString().trim();
      
      if (userId) {
        users.push({
          userId: userId,
          displayName: displayName || userId,
          pictureUrl: pictureUrl || '',
          statusMessage: statusMessage || ''
        });
      }
    });
    
    console.log(`ดึงข้อมูลผู้ใช้สำเร็จ: ${users.length} รายการ`);
    return users;
    
  } catch (error) {
    console.error('ข้อผิดพลาดในการดึงข้อมูลผู้ใช้:', error);
    return [];
  }
}

/**
 * บันทึกวันหมดอายุของ Rich Menu ลงชีต RichMenuExpiry
 */
function saveRichMenuExpiry(richMenuId, expiryDate, action, notes) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('RichMenuExpiry');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('RichMenuExpiry');
      sheet.getRange('A1:E1').setValues([['Rich Menu ID', 'วันหมดอายุ', 'การดำเนินการ', 'หมายเหตุ', 'สร้างเมื่อ']]);
    }
    const lastRow = sheet.getLastRow();
    const data = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 1).getValues() : [];
    let existingRow = -1;
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().trim() === richMenuId) {
        existingRow = i + 2;
        break;
      }
    }
    const expiryDateObj = new Date(expiryDate);
    const rowData = [richMenuId, expiryDateObj, action || 'delete', notes || '', new Date()];
    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, 5).setValues([rowData]);
      return { success: true, message: 'อัปเดตวันหมดอายุ Rich Menu สำเร็จ' };
    } else {
      sheet.appendRow(rowData);
      return { success: true, message: 'บันทึกวันหมดอายุ Rich Menu สำเร็จ' };
    }
  } catch (error) {
    return { success: false, message: 'เกิดข้อผิดพลาด: ' + error.message };
  }
}

/**
 * ดึงข้อมูลวันหมดอายุของ Rich Menu ทั้งหมด
 */
function getRichMenuExpiries() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('RichMenuExpiry');
    if (!sheet || sheet.getLastRow() < 2) return {};
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
    const expiries = {};
    data.forEach(row => {
      const richMenuId = row[0] ? row[0].toString().trim() : '';
      if (richMenuId) {
        expiries[richMenuId] = {
          expiryDate: row[1] instanceof Date ? row[1].toISOString() : null,
          action: row[2] || 'delete',
          notes: row[3] || '',
          createdAt: row[4] instanceof Date ? row[4].toISOString() : null
        };
      }
    });
    return expiries;
  } catch (error) {
    console.error('Error in getRichMenuExpiries:', error);
    return {};
  }
}

/**
 * ลบวันหมดอายุของ Rich Menu
 */
function deleteRichMenuExpiry(richMenuId) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('RichMenuExpiry');
    if (!sheet || sheet.getLastRow() < 2) return { success: false, message: 'ไม่พบข้อมูลวันหมดอายุ' };
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i][0] && data[i][0].toString().trim() === richMenuId) {
        sheet.deleteRow(i + 2);
        return { success: true, message: 'ยกเลิกวันหมดอายุสำเร็จ' };
      }
    }
    return { success: false, message: 'ไม่พบ Rich Menu ID นี้ในรายการหมดอายุ' };
  } catch (error) {
    return { success: false, message: 'เกิดข้อผิดพลาด: ' + error.message };
  }
}

/**
 * แปลงค่าใดๆ ให้เป็น Date object (รองรับทั้ง Date, string, number)
 */
function cleanupBlankMenuCache() {
  PropertiesService.getScriptProperties().deleteProperty('BLANK_RICHMENU_ID');
}

function getOrCreateBlankRichMenu(accessToken) {
  const props = PropertiesService.getScriptProperties();
  let blankId = props.getProperty('BLANK_RICHMENU_ID');
  if (blankId) {
    const check = UrlFetchApp.fetch('https://api.line.me/v2/bot/richmenu/' + blankId, {
      method: 'get', headers: { 'Authorization': 'Bearer ' + accessToken }, muteHttpExceptions: true
    });
    if (check.getResponseCode() === 200) return blankId;
    props.deleteProperty('BLANK_RICHMENU_ID');
  }
  const resp = UrlFetchApp.fetch('https://api.line.me/v2/bot/richmenu', {
    method: 'post', contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + accessToken },
    payload: JSON.stringify({
      size: { width: 2500, height: 843 }, selected: false,
      name: '[ระบบ] ซ่อนเมนู', chatBarText: ' ',
      areas: [{ bounds: { x: 0, y: 0, width: 2500, height: 843 }, action: { type: 'postback', data: 'blank' } }]
    }),
    muteHttpExceptions: true
  });
  if (resp.getResponseCode() === 200) {
    blankId = JSON.parse(resp.getContentText()).richMenuId;
    props.setProperty('BLANK_RICHMENU_ID', blankId);
    return blankId;
  }
  return null;
}

function switchToBlankMenu(accessToken) {
  const blankId = getOrCreateBlankRichMenu(accessToken);
  if (!blankId) return;
  UrlFetchApp.fetch('https://api.line.me/v2/bot/user/all/richmenu/' + blankId, {
    method: 'post', headers: { 'Authorization': 'Bearer ' + accessToken }, muteHttpExceptions: true
  });
}

function toDate_(val) {
  if (val instanceof Date) return val;
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * ตรวจสอบและดำเนินการกับ Rich Menu ที่หมดอายุ
 */
function checkAndExpireRichMenus() {
  const results = { processed: [], skipped: [], errors: [] };
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RichMenuExpiry');
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: true, message: 'ไม่มีรายการหมดอายุ', results };
    }
    const accessTokens = getAccessTokenInternal();
    if (!accessTokens || accessTokens.length === 0) {
      return { success: false, message: 'ไม่พบ Access Token', results };
    }
    const accessToken = accessTokens[0];
    const now = new Date();
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
    const rowsToDelete = [];

    data.forEach((row, index) => {
      const richMenuId = row[0] ? row[0].toString().trim() : '';
      const expiryDate = toDate_(row[1]);
      const action = (row[2] || 'delete').toString().trim();

      if (!richMenuId || !expiryDate) { results.skipped.push(richMenuId || '(ไม่มี ID)'); return; }

      if (expiryDate > now) { results.skipped.push(richMenuId); return; }

      try {
        let done = false;
        if (action === 'delete') {
          try { switchToBlankMenu(accessToken); } catch(ignored) {}
          // fallback: ลบ default เผื่อ switchToBlankMenu ไม่สำเร็จ
          UrlFetchApp.fetch('https://api.line.me/v2/bot/user/all/richmenu', {
            method: 'delete', headers: { 'Authorization': 'Bearer ' + accessToken }, muteHttpExceptions: true
          });
          const resp = UrlFetchApp.fetch('https://api.line.me/v2/bot/richmenu/' + richMenuId, {
            method: 'delete', headers: { 'Authorization': 'Bearer ' + accessToken }, muteHttpExceptions: true
          });
          const code = resp.getResponseCode();
          done = (code === 200 || code === 404);
          if (!done) results.errors.push(richMenuId + ' (HTTP ' + code + ')');
          console.log('[Expiry] delete ' + richMenuId + ' → ' + code);
        } else if (action === 'removeDefault') {
          try { switchToBlankMenu(accessToken); } catch(ignored) {}
          // fallback: ลบ default เผื่อ switchToBlankMenu ไม่สำเร็จ
          UrlFetchApp.fetch('https://api.line.me/v2/bot/user/all/richmenu', {
            method: 'delete', headers: { 'Authorization': 'Bearer ' + accessToken }, muteHttpExceptions: true
          });
          done = true;
          console.log('[Expiry] removeDefault ' + richMenuId + ' → done');
        }
        if (done) {
          rowsToDelete.push(index + 2);
          results.processed.push({ id: richMenuId, action });
        }
      } catch (e) {
        results.errors.push(richMenuId + ': ' + e.message);
      }
    });

    for (let i = rowsToDelete.length - 1; i >= 0; i--) sheet.deleteRow(rowsToDelete[i]);

    const msg = results.processed.length > 0
      ? 'ดำเนินการแล้ว ' + results.processed.length + ' รายการ'
      : results.errors.length > 0
        ? 'มีข้อผิดพลาด: ' + results.errors.join(', ')
        : 'ยังไม่มีรายการหมดอายุ (' + data.length + ' รายการ)';
    return { success: true, message: msg, results };

  } catch (error) {
    return { success: false, message: 'เกิดข้อผิดพลาด: ' + error.message, results };
  }
}

/**
 * Debug: ดูข้อมูลดิบใน RichMenuExpiry sheet + เปรียบเทียบกับเวลาปัจจุบัน
 */
function debugRichMenuExpiry() {
  try {
    const now = new Date();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RichMenuExpiry');
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: true, now: now.toISOString(), rows: [], message: 'Sheet ว่างหรือไม่มีข้อมูล' };
    }
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
    const rows = data.map((row, i) => {
      const rawVal = row[1];
      const converted = toDate_(rawVal);
      return {
        rowNum: i + 2,
        richMenuId: row[0] ? row[0].toString() : '(ว่าง)',
        rawExpiryValue: rawVal,
        rawType: typeof rawVal,
        isDateObj: rawVal instanceof Date,
        convertedISO: converted ? converted.toISOString() : '(แปลงไม่ได้)',
        action: row[2] ? row[2].toString() : '(ว่าง)',
        notes: row[3] ? row[3].toString() : '',
        isExpired: converted ? (converted <= now) : false,
        diffMinutes: converted ? Math.round((now - converted) / 60000) : null
      };
    });
    return { success: true, now: now.toISOString(), scriptTz: Session.getScriptTimeZone(), rows };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * สร้าง Time Trigger สำหรับตรวจสอบวันหมดอายุทุก 1 นาที
 */
function createExpiryTrigger() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    for (const t of triggers) {
      if (t.getHandlerFunction() === 'checkAndExpireRichMenus') ScriptApp.deleteTrigger(t);
    }
    ScriptApp.newTrigger('checkAndExpireRichMenus').timeBased().everyMinutes(1).create();
    return { success: true, message: 'สร้าง Trigger สำเร็จ — ระบบจะตรวจสอบทุก 1 นาที' };
  } catch (error) {
    return { success: false, message: 'ไม่สามารถสร้าง Trigger: ' + error.message };
  }
}

/**
 * ลบ Time Trigger สำหรับตรวจสอบวันหมดอายุ
 */
function deleteExpiryTrigger() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    let deleted = 0;
    for (const t of triggers) {
      if (t.getHandlerFunction() === 'checkAndExpireRichMenus') {
        ScriptApp.deleteTrigger(t);
        deleted++;
      }
    }
    return { success: true, message: deleted > 0 ? 'หยุดการตรวจสอบอัตโนมัติสำเร็จ' : 'ไม่พบ Trigger ที่จะหยุด' };
  } catch (error) {
    return { success: false, message: 'ไม่สามารถลบ Trigger: ' + error.message };
  }
}

/**
 * ตรวจสอบสถานะ Trigger
 */
function getExpiryTriggerStatus() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    const count = triggers.filter(t => t.getHandlerFunction() === 'checkAndExpireRichMenus').length;
    return { active: count > 0, count: count };
  } catch (e) {
    return { active: false, count: 0, error: e.message };
  }
}

/**
 * ดึงรูปภาพ Rich Menu จาก LINE API แล้วส่งกลับเป็น base64 data URL
 */
function getRichMenuImageFromLine(richMenuId) {
  var accessTokens = getAccessTokenInternal();
  if (!accessTokens || accessTokens.length === 0) return null;
  var accessToken = accessTokens[0];
  try {
    var response = UrlFetchApp.fetch(
      'https://api-data.line.me/v2/bot/richmenu/' + richMenuId + '/content',
      { method: 'get', headers: { 'Authorization': 'Bearer ' + accessToken }, muteHttpExceptions: true }
    );
    if (response.getResponseCode() === 200) {
      var blob = response.getBlob();
      var contentType = blob.getContentType() || 'image/jpeg';
      return 'data:' + contentType + ';base64,' + Utilities.base64Encode(blob.getBytes());
    }
    return null;
  } catch (e) {
    console.error('getRichMenuImageFromLine error:', e);
    return null;
  }
}

/**
 * ดึงข้อมูลโปรไฟล์ผู้ใช้จาก LINE API
 */
function getUserProfile(userId) {
  try {
    const accessTokens = getAccessTokenInternal();
    if (!accessTokens || accessTokens.length === 0) {
      return { error: "ไม่พบ Access Token" };
    }
    
    const accessToken = accessTokens[0];
    const url = `https://api.line.me/v2/bot/profile/${userId}`;
    
    const options = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode === 200) {
      return JSON.parse(responseText);
    } else {
      console.error('Error fetching user profile:', responseText);
      return { 
        error: `HTTP ${responseCode}`,
        message: responseText 
      };
    }
  } catch (error) {
    console.error('Exception fetching user profile:', error);
    return { error: error.message };
  }
}