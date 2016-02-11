
String beanName = "BeanSadtler";
const uint8_t writeScratch = 1;
const uint8_t sendScratch = 2;
uint8_t previousColor[] = {0, 0, 0, 0};

void setup() {
  // Setup bean
  Bean.setBeanName(beanName);
  Bean.enableWakeOnConnect(true);


  Bean.setScratchData(writeScratch, previousColor, 3);
  Bean.setScratchData(sendScratch, previousColor, 3);
//  Bean.setLed(0,0,255);
}

// the loop routine runs over and over again forever:
void loop() {

  bool connected = Bean.getConnectionState();
  if(connected) {
    int temperature = Bean.getTemperature();
    // read the color sent from the central
   
 
 // Format the output like "Battery voltage: 2.60 V"

 
  
    ScratchData receivedData = Bean.readScratchData(writeScratch); 
    uint8_t redLed = receivedData.data[0];
    uint8_t greenLed = receivedData.data[1];
    uint8_t blueLed = receivedData.data[2];
    uint16_t batteryReading =  Bean.getBatteryVoltage(); 
//    String stringToPrint = String();
//    stringToPrint = stringToPrint + "Battery voltage: " + batteryReading/100 + "." + batteryReading%100 + " V";
    AccelerationReading acceleration = Bean.getAcceleration();
  
    // Format the serial output like this:    "X: 249  Y: -27   Z: -253"
    String stringToPrint = String();
    stringToPrint = stringToPrint + "X: " + acceleration.xAxis + "\tY: " + acceleration.yAxis + "\tZ: " + acceleration.zAxis;
  
    Bean.setLed(redLed, greenLed, blueLed);
//    uint8_t newColor[] = {acceleration.xAxis, acceleration.yAxis, acceleration.zAxis, temperature};
//         Bean.setScratchData(sendScratch, newColor, 4);
    //if color is different
    int buf = 25;
//    if(redLed != previousColor[0] && greenLed != previousColor[1] && blueLed != previousColor[2]){
    if(previousColor[0] + buf < acceleration.xAxis || previousColor[0] - buf > acceleration.xAxis){
         uint8_t newColor[] = {acceleration.xAxis, acceleration.yAxis, acceleration.zAxis, temperature, batteryReading};
         Bean.setScratchData(sendScratch, newColor, 5);

         previousColor[0] = acceleration.xAxis;
         previousColor[1] = acceleration.yAxis;
         previousColor[3] = acceleration.zAxis;
         previousColor[2] = temperature;
         previousColor[4] = batteryReading;
    }
    
  }
  else {
    
    // Turn LED off and put to sleep. 
    Bean.setLed(0, 0, 0);
    Bean.sleep(0xFFFFFFFF); 
  }
}

