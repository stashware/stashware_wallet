/* eslint-disable */
class interrupt {
  constructor(args) {
    this.msec = args.msec
    this.types = []
    this.err = 0
    this.runTime = this.interval(() => {
      let nowMsec = Date.now()
      for (let obj of this.types) {
        if (typeof (obj.checkFunc) === 'function' || typeof obj.split === 'number') {
          try {
            let bret = false
            if (obj.split) {
              if (obj._lastmsec === undefined) {
                obj._lastmsec = 0
              }
              if (obj._lastmsec + obj.split > nowMsec) {
                bret = false
              } else {
                obj._lastmsec = nowMsec
                bret = true
              }
            } else {
              bret = obj.checkFunc(nowMsec)
            }
            if (bret && typeof (obj.doFunc) === 'function') {
              obj.doFunc(nowMsec)
            }
          } catch (e) {
            console.log(e)
          }
        }
      }
    }, this.msec)
  }

  interval(func, wait) {
    var interv = function () {
      func()
      return setTimeout(interv, wait)
    }
    return setTimeout(interv, wait)
  }

  registe(type) {
    return this.types.push(type)
  }
  remove(type) {
    let errno = this.types.indexOf(type)
    return this.types.splice(errno, 1)
  }
  close() {
    clearTimeout(this.runTime)
  }
}
export default interrupt
