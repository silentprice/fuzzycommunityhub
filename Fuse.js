import Fuse from 'fuse.js';
const data = [{ title: 'XRP News' }, { title: 'Community Update' }];
const fuse = new Fuse(data, { keys: ['title'] });
const results = fuse.search('news');
console.log(results);