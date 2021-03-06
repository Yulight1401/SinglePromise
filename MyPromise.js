/**
 * MPromise - Description
 *
 * @param {type} func Description
 *
 * @return {type} Description
 */
function MPromise (func) {
	this.val
	this.stats = 'loading'
	this.resolveFunc = [] //是一个作业队列，用于多次绑定then时
	this.rejectFunc = []
	this.catchFunc = function () {}
	var self = this
	try {
		func(this.resolve.bind(this), this.reject.bind(this))
		//需要将MPromise的作用域绑定
	} catch (e) {
		setTimeout(function () {
			self.catchFunc(e)
		}, 0)
	} finally {

	}
}

/**
 * all - Description
 *
 * @param {type} funcArray Description
 *
 * @return {type} Description
 */
MPromise.all = function (funcArray) {
	var result = []
	return new MPromise(function (res, rej) {
		var index = 0
		var result = []
		var leng = funcArray.length
		funcArray.map(function (func) {
			func.then(function (data) {
				index++
				result.push(data)
				if (index === leng) {
					res(result)
				}
			}, function (data) {
				 rej(data)
			})
		})
	})
}

/**
 * race - Description
 *
 * @param {type} funcArray Description
 *
 * @return {type} Description
 */
MPromise.race = function (funcArray) {
	return new MPromise(function (res, rej) {
		funcArray.map(function (func) {
			func.then(function (data) {
				 res(data)
			}, function (data) {
				 rej(data)
			})
		})
	})
}

/**
 * resolve - Description
 *
 * @param {type} val Description
 *
 * @return {type} Description
 */
MPromise.prototype.resolve = function (val) {
	var self = this
	self.val = val
	if (self.stats === 'loading') {
		self.stats = 'resolved'
		setTimeout(function () {
			//确保绑定回调函数之后，再执行方法,在链式回调中，确保全部执行，将他们放入队列中
			self.resolveFunc.map(function (func) {
				func(self.val)
			})
		}, 0)
	}
}

/**
 * reject - Description
 *
 * @param {type} val Description
 *
 * @return {type} Description
 */
MPromise.prototype.reject = function (val) {
	var self = this
	self.val = val
	if (self.stats === 'loading') {
		self.stats = 'rejected'
		setTimeout(function () {
			self.rejectFunc.map(function (func) {
				func(self.val)
			})
		}, 0)
	}
}

/**
 * catch - Description
 *
 * @param {type} catchFunc Description
 *
 * @return {type} Description
 */
MPromise.prototype.catch = function (catchFunc) {
	var self = this
	return new MPromise(function (res, rej) {
		self.catchFunc = catchFunc
		rej()
	})
}

/**
 * then - Description
 *
 * @param {type} resolveFunc Description
 * @param {type} rejectFunc  Description
 *
 * @return {type} Description
 */
MPromise.prototype.then = function (resolveFunc, rejectFunc) {
	var self = this
	return new MPromise(function (res, rej) { //返回新的Promise对象，并且传递val
		function resolveFuncWrap() {
      var result = resolveFunc(self.val) //立即执行当前的resolve函数，并将返回值传递给下一个resolv参数
			if (result && typeof result.then === 'function') {
        //判断result是否是promise,如果是传入新对象的回调函数
        result.then(res, rej)
      } else {
        res(result);
      }
    }
    function rejectFuncWrap() {
      var result = rejectFunc(self.val)
			if (result && typeof result.then === 'function') {
        result.then(res, rej)
      } else {
        rej(result)
      }
    }
		self.resolveFunc.push(resolveFuncWrap) //绑定then中的回调函数
		self.rejectFunc.push(rejectFuncWrap)
	})
}

/*Customer TestCases*/

var fn = function (resolve, reject) {
  console.log('begin to execute!')
  var number = Math.random()
  if (number <= 0.5) {
		setTimeout(function () {
			resolve('less than ' + 1000*number)
		}, 1000*number)
  } else {
    reject('greater than 0.5')
  }
}


var fn2 = function (resolve, reject) {
	resolve()
	throw 'oh my god'
}

var p = new MPromise(fn)
var p2 = new MPromise(fn)
var p3 = new MPromise(fn)
var p4 = new MPromise(fn2)
var p5 = new Promise(fn)

p.then(function (data) {
	console.log('1',data)
}, function (data) {
	console.log('1',data)
})

p.then(function (data) {
	console.log('2',data)
}, function (data) {
	console.log('2',data)
})
// p4.catch(function (e) {
// 	console.log(e)
// }).then(function () {
// 	console.log('not reject')
// },function () {
// 	console.log('isrejected')
// })
// MPromise.all([p,p2,p3]).then(function (val) {
// 	console.log('resove',val)
// }, function (data) {
// 	console.log('reject',data)
// })
// p.then(function(data) {
//   console.log('resolve: ', data);
// 	return new MPromise(function(resolve){
//     var innerData = 'hello third time!';
//     resolve(innerData);
//   })
// }, function(data) {
//   console.log('reject: ', data);
// }).then(function(data) {
//   console.log('resolve: ', data);
// 	return 123
// }, function(data) {
//   console.log('reject: ', data);
// }).then(function(data) {
//   console.log('resolve: ', data);
// }, function(data) {
//   console.log('reject: ', data);
// })
