import { useState } from "react";
import axios from "axios";

// Green form ke saath match karte hue inputs: halka cream-lime background,
// gehra green text taake saaf nazar aaye
const inputClass =
  "w-full rounded-md border border-[#7f9a0c] bg-[#f6fbd9] px-3 py-1.5 text-sm font-medium text-[#1d2a02] placeholder:text-[#6b7f1a] focus:outline-none focus:ring-2 focus:ring-[#1d2a02] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50";

const labelClass = "block text-sm font-semibold text-[#1d2a02]";

const primaryBtn =
  "inline-flex items-center justify-center rounded-md bg-[#1d2a02] px-4 py-2 text-sm font-semibold text-[#d9f542] transition-colors hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#1d2a02] focus:ring-offset-2 focus:ring-offset-[#a7cb12] disabled:opacity-50";

function CreateProduct() {
  const [CreateProduct, setCreateProduct] = useState({
    title: "",
    desc: "",
    category: "",
    price: "",
  });

  const [imageFile, setImageFile] = useState(null); // asli file (backend ko jayegi)
  const [preview, setPreview] = useState(""); // sirf screen par dikhane ke liye
  const [fileKey, setFileKey] = useState(0); // submit ke baad file input reset karne ke liye
  const [errorMsg, setErrorMsg] = useState("");

  const ChangeHadler = (evt) => {
    const { name, value } = evt.target;
    setCreateProduct((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Local computer se image select karna
  const ImageHandler = (evt) => {
    const file = evt.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Sirf image file select karein");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image 5MB se choti honi chahiye");
      return;
    }

    setErrorMsg("");
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // File bhejne ke liye JSON nahi, FormData chahiye
    const formData = new FormData();
    formData.append("title", CreateProduct.title);
    formData.append("desc", CreateProduct.desc);
    formData.append("category", CreateProduct.category);
    formData.append("price", CreateProduct.price);
    if (imageFile) formData.append("img", imageFile); // "img" backend upload.single("img") se match hona chahiye

    try {
      const url = "http://localhost:3000/api/products";
      // Content-Type khud set mat karna, axios FormData par khud laga deta hai
      const response = await axios.post(url, formData);
      console.log("Product created successfully:", response.data);

      // Form reset
      setCreateProduct({
        title: "",
        desc: "",
        category: "",
        price: "",
      });
      setImageFile(null);
      setPreview("");
      setFileKey((k) => k + 1);
      setErrorMsg("");
    } catch (error) {
      console.error("Tera Code main bug hai bhi", error);
      setErrorMsg("Product create nahi hua, dobara try karein");

      if (error.response) {
        console.log("Backend Error:", error.response.data);
        console.log("Status:", error.response.status);
      }
    }
  };

  return (
    <section className="relative min-h-screen w-full bg-gray-900">
      {/* Background + bubbles (fixed: scroll par bhi poori screen cover karta hai) */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop)",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute rounded-full bg-white/20 opacity-0 animate-product-bubble" />
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center p-4 md:p-8 lg:p-12">
        {/* Grid */}
        <div className="grid w-full max-w-6xl flex-grow grid-cols-1 items-center gap-8 p-2 md:p-6 lg:grid-cols-2">
          {/* Left: live preview + title */}
          <div className="flex flex-col justify-end gap-6 p-2 lg:p-6">
            <div className="max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-xl backdrop-blur-sm">
              <div className="flex aspect-[4/3] items-center justify-center bg-gray-100">
                <img
                  src={
                    preview ||
                    "https://images.pexels.com/photos/33272308/pexels-photo-33272308.jpeg"
                  }
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-1 p-4">
                <h3 className="truncate font-semibold text-gray-900">
                  {CreateProduct.title}
                </h3>
                <p className="line-clamp-2 text-sm text-gray-500">
                  {CreateProduct.desc}
                </p>
                {CreateProduct.category && (
                  <p className="text-xs font-medium text-gray-600">
                    {CreateProduct.category}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <span className="font-bold text-indigo-600">
                    {CreateProduct.price && `Rs. ${CreateProduct.price}`}
                  </span>
                </div>
              </div>
            </div>

            <h1 className="max-w-lg text-4xl font-extrabold leading-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl">
              Create Your Product
            </h1>
          </div>

          {/* Right: form (chota: max-w-md) */}
          <div className="w-full max-w-md rounded-lg bg-[#a7cb12] p-5 shadow-xl md:p-6 lg:justify-self-end">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label htmlFor="title" className={labelClass}>
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  value={CreateProduct.title}
                  placeholder="Product ka naam"
                  className={inputClass}
                  onChange={ChangeHadler}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="category" className={labelClass}>
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={CreateProduct.category}
                  onChange={ChangeHadler}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  <option value="Clothes">Clothes</option>
                  <option value="Tech">Tech</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Watches">Watches</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="desc" className={labelClass}>
                  Description
                </label>
                <textarea
                  id="desc"
                  name="desc"
                  value={CreateProduct.desc}
                  onChange={ChangeHadler}
                  rows={3}
                  placeholder="Product ke baare mein likhein..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="price" className={labelClass}>
                  Price
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  value={CreateProduct.price}
                  onChange={ChangeHadler}
                  min={0}
                  placeholder="e.g. 1999"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="img" className={labelClass}>
                  Product Image
                </label>
                <input
                  key={fileKey}
                  id="img"
                  name="img"
                  type="file"
                  accept="image/*"
                  onChange={ImageHandler}
                  className={`${inputClass} cursor-pointer file:mr-3 file:rounded file:border-0 file:bg-[#1d2a02] file:px-3 file:py-1 file:text-sm file:font-semibold file:text-[#d9f542]`}
                />

                {errorMsg && (
                  <p className="text-xs font-medium text-red-800">{errorMsg}</p>
                )}
              </div>

              <button type="submit" className={`${primaryBtn} w-full`}>
                Create Product
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes product-bubble {
          0% { transform: translateY(0) translateX(0) scale(0.5); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(var(--dx, 0)) scale(1.2); opacity: 0; }
        }
        .animate-product-bubble {
          animation: product-bubble 15s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

export default CreateProduct;