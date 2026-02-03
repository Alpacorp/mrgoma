import { TitleSection } from '@/app/ui/sections';

const LoginForm = () => {
  return (
    <div className="w-full max-w-96">
      <form className="w-full">
        <h3 className="text-3xl font-medium text-center mb-8  text-[#272727]">Seller Portal</h3>
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block" htmlFor="">
            <span className="text-lime-400 mr-2">*</span>
            Usuario
          </label>
          <input
            type="text"
            autoComplete="off"
            className={`w-full bg-white rounded-md py-2 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-shadow border border-gray-300
                }`}
          />
        </div>
        <div className="mb-8">
          <label className="text-sm font-medium text-gray-700 mb-2 block" htmlFor="">
            <span className="text-lime-400 mr-2">*</span>
            Contraseña
          </label>
          <input
            type="text"
            autoComplete="off"
            className={`w-full bg-white rounded-md py-2 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-shadow border border-gray-300
                }`}
          />
        </div>
        <button className="w-full py-2 text-lg font-medium rounded-lg transition-colors bg-green-600 hover:bg-green-700 text-white cursor-pointer">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;
