// var twoSum = function (nums, target) {
//   for (let i = 0; i < nums.length; i++) {
//     let counter = 0;
//     let res = [];
//     while (counter < nums.length) {
//       if (nums[counter] + nums[counter + 1] === target) {
//         res.push(counter) && res.push(counter + 1);
//         return res;
//       }
//       counter++;
//     }
//   }
// };

// console.log(twoSum([15, 2, 7, 11], 18));

// var twoSum = function (nums, target) {
//   let counter = 0;
//   let res = [];
//   while (counter < nums.length) {
//     if (nums[counter] + nums[counter + 1] === target) {
//       res.push(counter) && res.push(counter + 1);
//       return res;
//     }
//     counter++;
//   }
// };

// console.log(twoSum([2, 7, 11, 15], 9));

var twoSum = function (nums, target) {
  const map = new Map(); // value -> index {3->0,4->1,}

  for (let i = 0; i < nums.length; i++) {
    let complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
};

console.log(twoSum([3, 4, 3], 6));
