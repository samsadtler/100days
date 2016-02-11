
String beanName = "BeanSadtler";
const uint8_t ledScratch = 1;
const uint8_t motorSwitch = 1;
long previousMillis = 0;
boolean headingRange = false;
boolean onConnect = true;
long interval = 0;
int motorState = LOW;

#define R_MOTOR_PIN 3
#define L_MOTOR_PIN 2
//String motorSwitch = LOW;

void setup() {
  // Setup bean
  
  Bean.setBeanName(beanName);
  Bean.enableWakeOnConnect(true);
  Bean.setLed(0, 0, 0);
  pinMode(L_MOTOR_PIN, OUTPUT);
  pinMode(R_MOTOR_PIN, OUTPUT);
  // Reset the scratch data area 1. 
  uint8_t resetLedBuffer[] = {
    0  };
  Bean.setScratchData(ledScratch, resetLedBuffer, 1);


}

// the loop routine runs over and over again forever:
void loop() {

  bool connected = Bean.getConnectionState();

  if(connected) {
    // Update LED

    ScratchData receivedData = Bean.readScratchData(ledScratch); 
    uint8_t deltaHeading = receivedData.data[0];
    if(onConnect){
      onConnect = false;
      pulseInterval (-1, 90, 0);
    } 
    else {
      pulseInterval (deltaHeading, 90, 0);
    }

  }
  else {
    // Turn LED off and put to sleep. 
    onConnect = true;
//    Bean.setLed(0, 0, 0);
    uint8_t deltaHeading = -1;
    pulseInterval (-1, 0, 90);
    Bean.sleep(0xFFFFFFFF); 

  }
}


void pulseInterval(uint8_t deltaHeading, int highRange, int lowRange) {
  interval = map (deltaHeading, lowRange, highRange , 25, 750);
  unsigned long currentMillis = millis();
  if (deltaHeading > motorSwitch && deltaHeading < 91){
    if(currentMillis - previousMillis > interval) {
      previousMillis = currentMillis;   

      // if the LED is off turn it on and vice-versa:
      if (motorState == LOW){
        motorState = HIGH;
//        Bean.setLed(255, 0, 255);
        digitalWrite(L_MOTOR_PIN, motorState);
        digitalWrite(R_MOTOR_PIN, motorState);
      }
      else{
        motorState = LOW;
//        Bean.setLed(0, 0, 0);
        digitalWrite(L_MOTOR_PIN, motorState);
        digitalWrite(R_MOTOR_PIN, motorState);
      }
    }
  }
  else {
    motorState = LOW;
    digitalWrite(L_MOTOR_PIN, motorState);
    digitalWrite(R_MOTOR_PIN, motorState);
  }



}











