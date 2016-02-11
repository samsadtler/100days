
String beanName = "BeanSadtler";
const uint8_t ledScratch = 1;
const uint8_t motorSwitch = 0;
long previousMillis = 0;
boolean headingRange = false;
long prevTimeOutMillis = 0;
long timeOutCount = 0;
long timeOutInterval = 0;
long interval = 100;
int motorState = LOW;
#define MOTOR_PIN 2
//String motorSwitch = LOW;

void setup() {
  // Setup bean
  Bean.setBeanName(beanName);
  Bean.enableWakeOnConnect(true);
  pinMode(MOTOR_PIN, OUTPUT);
  // Reset the scratch data area 1. 
  uint8_t resetLedBuffer[] = {
    0    };
  Bean.setScratchData(ledScratch, resetLedBuffer, 1);

}

// the loop routine runs over and over again forever:
void loop() {

  bool connected = Bean.getConnectionState();

  if(connected) {

    // Update LED
    ScratchData receivedData = Bean.readScratchData(ledScratch); 

    uint8_t deltaHeading = receivedData.data[0];
    if (deltaHeading > -1 && deltaHeading < 31){
      headingRange = true;
    }
    if (deltaHeading < 0 || deltaHeading < 30){
      headingRange = false;
      timeOutCount = 0;
    }

    if (timeOutCount < 50 && headingRange == true){
      
      if (deltaHeading > motorSwitch){
        //      digitalWrite(MOTOR_PIN, HIGH);
        interval = map (deltaHeading, 30, 0 , 50, 1500);
        unsigned long currentMillis = millis();

        if(currentMillis - previousMillis > interval) {
          previousMillis = currentMillis;   

          // if the LED is off turn it on and vice-versa:
          if (motorState == LOW){
            timeOutCount++;
            motorState = HIGH;
            Bean.setLed(255, 0, 255);
            digitalWrite(MOTOR_PIN, motorState);
          }
          else{
            motorState = LOW;
            Bean.setLed(0, 0, 0);
            digitalWrite(MOTOR_PIN, motorState);
          }
        }

      }
    }
    else {
      if(deltaHeading == -1 || timeOutCount > 50){
        motorState = LOW;
        Bean.setLed(0, 0, 0);
        digitalWrite(MOTOR_PIN, motorState);
      }
    }



  }
  else {

    // Turn LED off and put to sleep. 
    Bean.setLed(0, 0, 0);
    digitalWrite(MOTOR_PIN, LOW);
    Bean.sleep(0xFFFFFFFF); 

  }
}








