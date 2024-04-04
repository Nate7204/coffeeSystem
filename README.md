# coffeeSystem
Google App Script to convert Google Sheet input from JotForm into Google Calendar event and ZPL POP Email. The goal here is to take in data from the form and present it in a user friendly way on a google calendar event and a printed label.

# Description of Data Flow
1. Coffee Order is received from user through JotForm. JotForm Google Spreadsheets Integration sends order data to spreadsheet like this.
   
  | Name  | Email           | Date                                  | Order                                                                                                                        |Special Instructions|
  |-------|-----------------|---------------------------------------|------------------------------------------------------------------------------------------------------------------------------|--------------------|
  |Jessica|jessica@test.com|Wednesday, Apr 03, 2024 3:20 PM-3:25 PM|Chai Latte (Amount: 0.00 USD, Quantity: 1, Iced: No, Milk: Coconut, Syrups: Vanilla, Sauces: None, Dirty: No)\nTotal: 0.00 USD|With Nutmeg on top|
2. As data is pushed into spreadsheet, edit trigger causes coffeeSystem.js to be performed on new row. Imported from spread sheet into array
  ````
    [ 'Jessica',
    'jessica@test.com',
    'Wednesday, Apr 03, 2024 3:20 PM-3:25 PM',
    'Chai Latte (Amount: 0.00 USD, Quantity: 1, Iced: No, Milk: Coconut, Syrups: Vanilla, Sauces: None, Dirty: No)\nTotal: 0.00 USD',
    'With Nutmeg on top' ]
  ````
3. formatOrder is called on array to
  - Remove price text from Order
  - Format Order into user friendly text by removing unnecessary parentheses and commas and adding in line breaks after each individual detail of order
    - Call createLabel to have label begin printing while script finishing. This will convert Order into ZPL Printer language and send an email to POP3/SMTP server for printing
      ````
      ^XA
      ^FO15,30^ADN,18,10^FDJessica^FS
      ^FO15,50^ADN,18,10^FD ^FS
      ^FO15,70^ADN,18,10^FDChai Latte^FS
      ^FO15,90^ADN,18,10^FD  Iced: No^FS
      ^FO15,110^ADN,18,10^FD  Milk: Coconut^FS
      ^FO15,130^ADN,18,10^FD  Syrups: Vanilla^FS
      ^FO15,150^ADN,18,10^FD  Sauces: None^FS
      ^FO15,170^ADN,18,10^FD  Dirty: No^FS^FO15,190^ADN,18,10^FD^FS
      ^XZ
      ````
  - Concatenate Email and Special Instructions to Order. This is to combine all the data needed for the calendar event description into one string.
    ````
    "jessica@test.com\n\n
    Chai Latte\n
    Quantity: 1\n
      Iced: No\n
      Milk: Coconut\n
      Syrups: Vanilla\n
      Sauces: None\n
      Dirty: No\n\n
      Special Instructions:\nWith Nutmeg on top"
    ````
4. formatDate is called on array to standardize date to what Google Calendar will accept
  - JotForm exports date for event as:
    ````
    Wednesday, Apr 03, 2024 3:20 PM-3:25 PM
    ````
  - Since Google Calendar requires specific start and end times, above is converted into
    ````
    Wed Apr 03 2024 15:20:00 GMT-0500 (Central Daylight Time)
    Wed Apr 03 2024 15:25:00 GMT-0500 (Central Daylight Time)
    ````
5. Google Calendar API is called to create event with a Name, Start Time, End Time, Order information to be displayed for barista to fulfill the order.
