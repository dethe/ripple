class Ring {
  // A circular structure with a backing array
  // Backing array cannot grow or shrink, but the indexes used can be limited
  // Pushing an item will add it to the end, but wrap around and overwrite from the beginning (useful for frames)
  // next() and prev() will move the index by one, wrapping around as needed (useful for tools)
  // curr() will return the item at the index
  constructor(arg) {
    if (arg.length) {
      this.arr = arg;
      this.size = arg.length;
    } else {
      this.arr = new Array(arg);
      this.size = arg;
    }
    this.idx = 0;
    // if arg is an array, copy that as the backing array
    // if it is a number, create a backing array that size.
  }

  next() {
    this.idx = (this.idx + 1) % this.size;
  }
  prev() {
    this.idx = this.idx - 1;
    if (this.idx < 0) this.idx = this.size - 1;
  }
  curr() {
    return this.arr[this.idx];
  }
  push(item) {
    this.arr.shift(); //drop first item
    this.arr.push(item);
  }
  rotate() {
    // remove first item and place it last
    this.arr.push(this.arr.shift());
    // return last item after rotation
    return this.arr[this.arr.length - 1];
    // overwrite last buffer with current video image
  }
  forEach(fn, frameCount) {
    // call fn on the frameCount items at the end of the internal buffer
    let startIdx = this.arr.length - frameCount;
    for (let i = 0; i < frameCount; i++) {
      fn(this.arr[i + startIdx], i);
    }
  }
  forEachRev(fn, frameCount){
    for (let i = 0; i < frameCount; i++){
      fn(this.arr[this.arr.length - i - 1], i);
    }
  }
}
