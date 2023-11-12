export class NetworkUpdater {
  constructor(engine, eventType) {
    this.engine = engine;
    this.eventType = eventType;
    this.prevStr = '';
  }

  sendStateUpdate(newString) {
    if (this.prevStr === newString) {
      return;
    }
    this.engine.emit(this.eventType, newString);
    this.prevStr = newString;
  }
}