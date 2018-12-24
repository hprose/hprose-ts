import ByteStream from '../../io/ByteStream'
import Reader from '../../io/deserializers/Reader'
import { Guid } from 'guid-typescript';

test('test boolean deserialization', () => {
    let reader = new Reader(new ByteStream('tftftf'));
    expect(reader.deserialize()).toBe(true);
    expect(reader.deserialize()).toBe(false);
    expect(reader.deserialize(Boolean)).toBe(true);
    expect(reader.deserialize(Boolean)).toBe(false);
    expect(reader.deserialize(Number)).toBe(1);
    expect(reader.deserialize(Number)).toBe(0);
});

// test('test null deserialization', () => {
//     let writer = new Writer(new ByteStream());
//     writer.write(null);
//     writer.write(undefined);
//     writer.serialize(function() {});
//     writer.serialize(()=>{});
//     writer.serialize(function*() {yield 1;});
//     writer.serialize(async function(){});
//     writer.serialize(async()=>{});
//     expect(writer.stream.toString()).toBe('nnnnnnn');
// });

// test('test array deserialization', () => {
//     let writer = new Writer(new ByteStream());
//     (function(x, y, z) {
//         writer.write(arguments);
//     })(1, 2, 3);
//     writer.write([4, 5, 6]);
//     expect(writer.stream.toString()).toBe('a3{123}a3{456}');
// });

// test('test map deserialization', () => {
//     let writer = new Writer(new ByteStream());
//     writer.write(Object.create(null));
//     writer.write({});
//     writer.write({name: "Tom", age: 18});
//     let map = new Map<string, any>();
//     map.set("name", "Jerry");
//     map.set("age", 17);
//     writer.serialize(map);
//     writer.serialize(map);
//     expect(writer.stream.toString()).toBe('m{}m{}m2{s4"name"s3"Tom"s3"age"i18;}m2{r3;s5"Jerry"r5;i17;}r6;');
// });

// test('test object deserialization', () => {
//     class User {
//         public name: string = '';
//         public age: number = 0;
//     }
//     let user = new User();
//     user.name = "Tom";
//     user.age = 18;
//     let user2 = new User();
//     user2.name = "Jerry";
//     user2.age = 17;
//     let writer = new Writer(new ByteStream());
//     writer.write(user);
//     writer.write(user2);
//     expect(writer.stream.toString()).toBe('c4"User"2{s4"name"s3"age"}o0{s3"Tom"i18;}o0{s5"Jerry"i17;}');
// })

// test('test guid deserialization', () => {
//     let guid: Guid = Guid.parse('bf3066cf-7b5b-1edf-731e-05b2d25a4408');
//     let writer = new Writer(new ByteStream());
//     writer.serialize(guid);
//     writer.serialize(guid);
//     expect(writer.stream.toString()).toBe('g{bf3066cf-7b5b-1edf-731e-05b2d25a4408}r0;');
// })