#include <Arduino.h>

const int analogPin = A0;

int baseline = 0;
int thresholdOffset = 40;

void setup() {
  Serial.begin(9600);
  delay(1000);

  long sum = 0;
  for (int i = 0; i < 100; i++) {
    sum += analogRead(analogPin);
    delay(5);
  }
  baseline = sum / 100;
}

void loop() {
  int raw = analogRead(analogPin);
  bool loud = raw > baseline + thresholdOffset;

  Serial.print("{\"raw\":");
  Serial.print(raw);
  Serial.print(",\"baseline\":");
  Serial.print(baseline);
  Serial.print(",\"loud\":");
  Serial.print(loud ? "true" : "false");
  Serial.println("}");
  
  delay(50);
}
