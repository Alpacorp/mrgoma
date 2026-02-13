'use client';
import { signOut } from 'next-auth/react';

const page = () => {
  return (
    <div className="mt-8 p-8">
      <h1 className="text-center font-semibold">PAGINA PROTEGIDA POR SESIÓN</h1>
      <div className="flex justify-center mt-4">
        <button onClick={() => signOut()} className="bg-red-400 p-3 rounded-lg text-white">
          Close session
        </button>
      </div>
      <div className="mt-16">
        <p className="mb-8">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex nobis rerum suscipit aperiam
          id iste placeat, esse eveniet vel autem neque cupiditate deleniti fuga accusamus
          repellendus unde repudiandae hic obcaecati.
        </p>
        <p className="mb-8">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione eius aliquid nam
          laboriosam dolor quos minus id adipisci amet voluptatum delectus consequuntur eaque,
          veniam, numquam voluptas dolorum rem accusamus repellat, nulla aspernatur aperiam. Sunt
          quam neque consequuntur corrupti nam assumenda velit, quas atque optio enim quis facere
          commodi quaerat sapiente ad eos cum dolorem ipsum dignissimos! Quae nesciunt cupiditate,
          unde consequatur, iusto magnam et repellendus itaque dolores iure vitae ea sapiente.
          Officiis cum sunt dolorum vel ut? Cumque officiis veniam, eos atque nisi cupiditate, sunt
          perspiciatis quam dolorem consequuntur dicta voluptatum vel officia explicabo. Labore quas
          ipsam blanditiis aperiam sunt recusandae eligendi laudantium, beatae accusamus. Adipisci
          mollitia aut explicabo labore dolorum accusantium ipsam! Optio tenetur, saepe voluptate
          dicta recusandae odio iure incidunt reiciendis, ad doloribus facere. Vero minus recusandae
          fugiat quod repellendus exercitationem tempora eos magnam quia quas facilis vitae enim
          rerum natus odio tempore ipsum blanditiis, ea accusantium deserunt modi hic odit? Repellat
          iusto illum et eligendi facere nobis tempora eveniet minima magni labore beatae nihil
          praesentium, officia adipisci, veritatis quas at. Vitae, dicta maxime debitis incidunt nam
          exercitationem aut similique eius ipsam quia! Sit esse laudantium dolores distinctio,
          dolore nemo facilis ducimus reiciendis ex assumenda dolorem maxime, beatae magni. Autem
          quasi eveniet quo, eos quis eius dicta expedita alias voluptas incidunt sunt cupiditate
          exercitationem dolore voluptates neque veniam vel delectus, in asperiores harum rem
          maxime. Rerum qui tenetur nihil doloremque, alias suscipit sequi aliquid, soluta error
          atque earum veniam molestias inventore perspiciatis. Autem laudantium amet saepe iure
          aliquam sed, ut inventore beatae laborum, qui veniam, dolore dolor architecto eius quis
          odit numquam quaerat reiciendis eos unde deleniti quam. Quasi laborum magnam vel
          dignissimos, magni repudiandae veritatis molestiae corrupti ullam obcaecati ipsa dolor
          repellendus, provident accusamus illum suscipit eligendi corporis delectus minus inventore
          rerum consequatur! Sapiente molestiae reprehenderit eos, rem maiores quod sint,
          consequuntur earum dolorem ullam aut hic! Ab, obcaecati. Deserunt debitis fuga corporis ea
          qui totam accusamus vel voluptatem quas labore quod et quidem aut, itaque enim quam
          temporibus mollitia aspernatur dolores. Maiores, sit consequuntur! Est sequi voluptates
          mollitia! Voluptatem doloribus explicabo adipisci, non sequi praesentium velit corporis
          voluptatum quis, quos nisi omnis porro nam atque laboriosam, incidunt consequuntur
          similique provident? Et iste nisi reprehenderit nemo ipsam cupiditate sed molestias vero
          aperiam, quidem maxime consectetur modi, asperiores eos eius repellat maiores vitae iure
          expedita ullam placeat enim fugit numquam rem. Facilis animi eaque ullam cumque. Vel quis
          omnis provident voluptate autem? Cumque eaque architecto, velit hic, impedit repellat ut
          aspernatur ipsum neque vel porro ad accusamus inventore repellendus aliquam in eos aliquid
          consequatur adipisci vitae fuga. Nesciunt consequuntur cumque corporis optio debitis
          quidem ipsam esse unde vero pariatur deleniti officiis accusantium atque, totam explicabo
          ea excepturi distinctio nemo hic voluptatem iusto magni? Modi eius exercitationem eos
          omnis hic. Numquam consectetur libero doloribus. Odio, hic dolorem. Quam magnam illum quia
          id aliquam eveniet similique asperiores. Quod, reprehenderit! Dignissimos earum eius,
          dolores nulla consequatur harum explicabo? Quidem ipsam quisquam alias tempore
          consequatur, placeat natus inventore tenetur quos repudiandae animi?
        </p>
        <p className="mb-8">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione eius aliquid nam
          laboriosam dolor quos minus id adipisci amet voluptatum delectus consequuntur eaque,
          veniam, numquam voluptas dolorum rem accusamus repellat, nulla aspernatur aperiam. Sunt
          quam neque consequuntur corrupti nam assumenda velit, quas atque optio enim quis facere
          commodi quaerat sapiente ad eos cum dolorem ipsum dignissimos! Quae nesciunt cupiditate,
          unde consequatur, iusto magnam et repellendus itaque dolores iure vitae ea sapiente.
          Officiis cum sunt dolorum vel ut? Cumque officiis veniam, eos atque nisi cupiditate, sunt
          perspiciatis quam dolorem consequuntur dicta voluptatum vel officia explicabo. Labore quas
          ipsam blanditiis aperiam sunt recusandae eligendi laudantium, beatae accusamus. Adipisci
          mollitia aut explicabo labore dolorum accusantium ipsam! Optio tenetur, saepe voluptate
          dicta recusandae odio iure incidunt reiciendis, ad doloribus facere. Vero minus recusandae
          fugiat quod repellendus exercitationem tempora eos magnam quia quas facilis vitae enim
          rerum natus odio tempore ipsum blanditiis, ea accusantium deserunt modi hic odit? Repellat
          iusto illum et eligendi facere nobis tempora eveniet minima magni labore beatae nihil
          praesentium, officia adipisci, veritatis quas at. Vitae, dicta maxime debitis incidunt nam
          exercitationem aut similique eius ipsam quia! Sit esse laudantium dolores distinctio,
          dolore nemo facilis ducimus reiciendis ex assumenda dolorem maxime, beatae magni. Autem
          quasi eveniet quo, eos quis eius dicta expedita alias voluptas incidunt sunt cupiditate
          exercitationem dolore voluptates neque veniam vel delectus, in asperiores harum rem
          maxime. Rerum qui tenetur nihil doloremque, alias suscipit sequi aliquid, soluta error
          atque earum veniam molestias inventore perspiciatis. Autem laudantium amet saepe iure
          aliquam sed, ut inventore beatae laborum, qui veniam, dolore dolor architecto eius quis
          odit numquam quaerat reiciendis eos unde deleniti quam. Quasi laborum magnam vel
          dignissimos, magni repudiandae veritatis molestiae corrupti ullam obcaecati ipsa dolor
          repellendus, provident accusamus illum suscipit eligendi corporis delectus minus inventore
          rerum consequatur! Sapiente molestiae reprehenderit eos, rem maiores quod sint,
          consequuntur earum dolorem ullam aut hic! Ab, obcaecati. Deserunt debitis fuga corporis ea
          qui totam accusamus vel voluptatem quas labore quod et quidem aut, itaque enim quam
          temporibus mollitia aspernatur dolores. Maiores, sit consequuntur! Est sequi voluptates
          mollitia! Voluptatem doloribus explicabo adipisci, non sequi praesentium velit corporis
          voluptatum quis, quos nisi omnis porro nam atque laboriosam, incidunt consequuntur
          similique provident? Et iste nisi reprehenderit nemo ipsam cupiditate sed molestias vero
          aperiam, quidem maxime consectetur modi, asperiores eos eius repellat maiores vitae iure
          expedita ullam placeat enim fugit numquam rem. Facilis animi eaque ullam cumque. Vel quis
          omnis provident voluptate autem? Cumque eaque architecto, velit hic, impedit repellat ut
          aspernatur ipsum neque vel porro ad accusamus inventore repellendus aliquam in eos aliquid
          consequatur adipisci vitae fuga. Nesciunt consequuntur cumque corporis optio debitis
          quidem ipsam esse unde vero pariatur deleniti officiis accusantium atque, totam explicabo
          ea excepturi distinctio nemo hic voluptatem iusto magni? Modi eius exercitationem eos
          omnis hic. Numquam consectetur libero doloribus. Odio, hic dolorem. Quam magnam illum quia
          id aliquam eveniet similique asperiores. Quod, reprehenderit! Dignissimos earum eius,
          dolores nulla consequatur harum explicabo? Quidem ipsam quisquam alias tempore
          consequatur, placeat natus inventore tenetur quos repudiandae animi?
        </p>
      </div>
    </div>
  );
};

export default page;
