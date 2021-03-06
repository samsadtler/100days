
String beanName = "BeanSadtler";
const uint8_t ledScratch = 1;
const uint8_t motorSwitch = 0;
long previousMillis = 0;
boolean headingRange = false;
boolean ledOff = true;
long prevTimeOutMillis = 0;
long timeOutCount = 0;
long timeOutInterval = 0;
long interval = 100;
int motorState = LOW;
#define MOTOR_PIN 2
uint8_t deltaHeading = 0;
//String motorSwitch = LOW;

void setup() {
  // Setup bean
  Bean.setBeanName(beanName);
  Bean.enableWakeOnConnect(true);
  pinMode(MOTOR_PIN, OUTPUT);
  Bean.setLed(0, 0, 255);
  // Reset the scratch data area 1. 
  uint8_t resetLedBuffer[] = {
    0    };
  Bean.setScratchData(ledScratch, resetLedBuffer, 1);

}

// the loop routine runs over and over again forever:
void loop() {

  bool connected = Bean.getConnectionState();

  if(connected) {
//    Bean.setLed(250, 0, 0);
//     Update LED
//    Serial.println('connected');
    ScratchData receivedData = Bean.readScratchData(ledScratch); 

    deltaHeading = receivedData.data[0];
    if(deltaHeading < 0  && deltaHeading > -101){
       int val = deltaHeading; 
       val = map(val, -120 , 0, 0, 255);
       Bean.setLed(val, val, val);
       Serial.println('turn LED on');
       ledOff = false;
    };
     if(deltaHeading < -100){
       Bean.setLed(0, 0, 0);
       ledOff = true;
       Serial.println('turn LED off');
    };
  }
 // Turn LED off and put to sleep if there is no connection
 if (!ledOff){}
  else {
    Bean.setLed(0, 0, 0);
//    digitalWrite(MOTOR_PIN, LOW);
    Bean.sleep(0xFFFFFFFF); 

  }
}








