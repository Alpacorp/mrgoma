import CircleSpinner from '@/app/ui/icons/CircleSpinner'


const ButtonSpinner = ({text}: {text: string}) => {
  return (
    <button className="w-full text-base font-medium rounded-lg transition-colors bg-[#9dfb40] text-black cursor-pointer flex items-center justify-center py-2">
      <CircleSpinner className='text-black' size={80} />
      <span className='ml-2'>{text}</span> 
    </button>
  )
}

export default ButtonSpinner