// constants won't change. Used here to set a pin number :
const int ledPin =  13;      // the number of the LED pin

// Variables will change :
int ledState = LOW;             // ledState used to set the LED

// Generally, you should use "unsigned long" for variables that hold time
// The value will quickly become too large for an int to store
unsigned long previousMillis = 0;        // will store last time LED was updated

// constants won't change :
long interval = 1000;           // interval at which to blink (milliseconds)

void setup() {
  // set the digital pin as output:
  Serial.begin(57600);
//  pinMode(ledPin, OUTPUT);
  
}

// the loop routine runs over and over again forever:
void loop() {
   // Get the current acceleration with range of ±2g, 
   // and a conversion of 3.91×10-3 g/unit or 0.03834(m/s^2)/units. 
   AccelerationReading accel = Bean.getAcceleration();

   // Update LED color
   uint16_t r = (abs(accel.xAxis)) / 4;
   uint16_t g = (abs(accel.yAxis)) / 4;
   uint16_t b = (abs(accel.zAxis)) / 4;
   
   long accelTotal = (abs(accel.xAxis)+abs(accel.yAxis)+abs(accel.zAxis)) / 4;
   Serial.print("accelTotal:");
   Serial.println(accelTotal);
   
    
   Serial.print("interval:");
   Serial.println(interval  );
   Bean.sleep(100);
   
  // here is where you'd put code that needs to be running all the time.
  
  // check to see if it's time to blink the LED; that is, if the
  // difference between the current time and last time you blinked
  // the LED is bigger than the interval at which you want to
  // blink the LED.
  
  if (ledState == LOW){
     interval = interval/2;
     blink();
  }
   if (ledState == HIGH){
     interval = map(accelTotal , 70 , 400, 3000, 200);
     blink();
  }
  
}
 void blink(){
  unsigned long currentMillis = millis();
  if(currentMillis - previousMillis >= interval) {
      // save the last time you blinked the LED 
      previousMillis = currentMillis;   
     
      // if the LED is off turn it on and vice-versa:
      if (ledState == LOW){
        Bean.setLed(255,255,255);
  //      Bean.setLed((uint8_t)r,(uint8_t)g,(uint8_t)b);
        ledState = HIGH;
      }
      else{
        Bean.setLed(0,0,0);
        ledState = LOW;  
    }
      // set the LED with the ledState of the variable
    }
 }
