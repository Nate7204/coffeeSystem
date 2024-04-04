function createLabel(name, data){
  //data is array [Order Items]
  for(var item of data){
    //remove '\n\n' from formatting
    item = item.replaceAll('\n\n','');
    //Get Quantity of Item
    var quantityTextIndex = item.indexOf('Quantity: ');
    num = item.charAt(quantityTextIndex + 10);
    //Remove Quantity from string
    item = item.replace(/\nQuantity: [123]/, '');

    //Converting text into ZPL language
    //^XA - Format Start
    //^FO - Field Origin
    //^FD - Field Data
    //^FS - Field Separator
    //^XZ - Format End
    var label = 
    '^XA^FO15,30^ADN,18,10^FD' + name +
      '^FS^FO15,50^ADN,18,10^FD' + ' ' +
      '^FS^FO15,70^ADN,18,10^FD';
    var line = item.split('\n');
    var y = 90;
    for (var i = 0; i< line.length; i++){
      label += line[i] + '^FS^FO15,'+ y +'^ADN,18,10^FD';
      y+=20;
    }
    label += '^FS^XZ'
    console.log(label);
    //Send POP3 email for each item for # quantity of each item
    for(let i = 0; i<num; i++){
        MailApp.sendEmail('nathanschaperln@gmail.com', 'Label', label);
    }
  }
};

function formatOrder(data){
  //data is array [Name, Email, Date, Order]
  //finalizedOrder is array [Name, Date, Order(with email and instructions)]
  var finalizedOrder = [data[0],data[2], ""];
  var email = data[1];
  var rawOrder = data[3];
  var instructions = data[4];

  //Concatenantes Email to order if provided
  if(email){
    finalizedOrder[2] += email + "\n\n";
  }

  //Remove cost related text from order
  rawOrder = rawOrder.replace(/Amount: 0.00 USD, /g, "") 
    .replace(/\nTotal: 0.00 USD/g, "");
  //Split order into individual items
  items = rawOrder.split('\n');

  //Format each item and customization into new lines and add to order
  for(let i=0; i<items.length; i++){
    //Line after item name, each customization, and at end of order
    items[i] = items[i].replace(" (", '\n')
      .replaceAll(", ",'\n  ')
      .replace(")", '\n\n');
    finalizedOrder[2] += items[i];
  }

  //Send Label to Print
  createLabel(data[0],items);

  //Concatenantes Instrucitons to order if provided
  if(instructions){
    finalizedOrder[2] += "Special Instructions:\n" + instructions;
  }

  return finalizedOrder;
};

function formatDate(data){
  //data is array [Name, Date, Order]
  //finalizedOrder is array [Name, Start Date, End Date, Order]
  finalizedDate = [data[0], "", "", data[2]];

  //Start Date
  var date = new Date(data[1].split(/-(.*)/s)[0]);
  finalizedDate[1] = date;

  //End Date
  var endDate = new Date(data[1].split(/-(.*)/s)[0])
  endDate.setMinutes(endDate.getMinutes() + 5);
  finalizedDate[2] = endDate;

  return finalizedDate;
};

function sheetToCal(e){
  const cal = CalendarApp.getDefaultCalendar();
  const sheet = SpreadsheetApp.getActiveSheet();
  
  //Get newest order
  var rows = sheet.getLastRow();
  var columns = sheet.getLastColumn();

  //Extract data
  var data = [];
  for (let i=1; i<columns; i++){
    data.push(sheet.getRange(rows, i).getValue());
  }
  //Format Order and Print Label
  data = formatOrder(data);

  //Format Date with start and end time
  data = formatDate(data);

  //Create Event
  cal.createEvent(data[0], data[1], data[2],{description:data[3]});
}