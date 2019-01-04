function addImagesToResult(images, items, id, attributes) {
  let groups = {};
  let groupName;
  images.map((img) => {
    groupName = img.attributes.product_id;
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(img.attributes.image);
    if(typeof items.forEach !== "undefined") {
      items.forEach((item) => {
        if(attributes) {
          if(+item[attributes][id] === +groupName) {
            item[attributes]['images'] = groups[groupName];
          }
        } else {
          if(+item[id] === +groupName) {
            item['images'] = groups[groupName];
          }
        }
      })
    } else {
      if(items[id] === +groupName) {
        items[attributes]['images'] = groups[groupName];
      }
    }
  });
  return items;
}

module.exports = {addImagesToResult};
