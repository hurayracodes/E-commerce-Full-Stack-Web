import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Star, ImagePlus, X, Plus } from "lucide-react";

const API_URL = "http://localhost:3000/api/products";
const MAX_IMAGES = 6;
const MAX_SIZE_MB = 5;

const CLOTH_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SHOE_SIZES = ["38", "39", "40", "41", "42", "43", "44", "45"];

const inputClass =
  "w-full rounded-md border border-[#7f9a0c] bg-[#f6fbd9] px-3 py-1.5 text-sm font-medium text-[#1d2a02] placeholder:text-[#6b7f1a] focus:outline-none focus:ring-2 focus:ring-[#1d2a02] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50";
const labelClass = "block text-sm font-semibold text-[#1d2a02]";
const primaryBtn =
  "inline-flex items-center justify-center rounded-md bg-[#1d2a02] px-4 py-2 text-sm font-semibold text-[#d9f542] transition-colors hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#1d2a02] focus:ring-offset-2 focus:ring-offset-[#a7cb12] disabled:opacity-50";

const emptyForm = {
  title: "",
  desc: "",
  category: "",
  condition: "New",
  price: "",
  stock: "",
};

function CreateProduct() {
  const [form, setForm] = useState(emptyForm);
  const [sizes, setSizes] = useState([]);
  const [customSize, setCustomSize] = useState("");
  // har item: { file, url }  (url = sirf preview ke liye)
  const [images, setImages] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileKey, setFileKey] = useState(0);
  const imagesRef = useRef([]);
  imagesRef.current = images;

  // page chhodte waqt preview URLs free karo
  useEffect(
    () => () => imagesRef.current.forEach((i) => URL.revokeObjectURL(i.url)),
    []
  );

  const ChangeHadler = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- images ---------------- */
  const ImagesHandler = (e) => {
    const picked = Array.from(e.target.files || []);
    setFileKey((k) => k + 1); // input reset: wahi file dobara choose ho sake
    if (!picked.length) return;

    setErrorMsg("");
    const valid = [];
    for (const file of picked) {
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Sirf image file select karein.");
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setErrorMsg(`Har image ${MAX_SIZE_MB}MB se choti honi chahiye.`);
        continue;
      }
      valid.push({ file, url: URL.createObjectURL(file) });
    }

    setImages((prev) => {
      const room = MAX_IMAGES - prev.length;
      if (valid.length > room) {
        setErrorMsg(`Maximum ${MAX_IMAGES} images allowed hain.`);
        valid.slice(room).forEach((i) => URL.revokeObjectURL(i.url));
      }
      return [...prev, ...valid.slice(0, Math.max(room, 0))];
    });
  };

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  // thumbnail par click = wo main (pehli) image ban jaye
  const makeMain = (index) => {
    setImages((prev) => {
      const next = [...prev];
      const [picked] = next.splice(index, 1);
      return [picked, ...next];
    });
  };

  /* ---------------- sizes ---------------- */
  const toggleSize = (s) =>
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const addCustomSize = () => {
    const s = customSize.trim();
    if (s && !sizes.includes(s)) setSizes((prev) => [...prev, s]);
    setCustomSize("");
  };

  /* ---------------- submit ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.title.trim()) return setErrorMsg("Title likhein.");
    if (!form.category) return setErrorMsg("Category select karein.");
    if (form.price === "" || Number(form.price) < 0) return setErrorMsg("Sahi price likhein.");
    if (form.stock === "" || Number(form.stock) < 0) return setErrorMsg("Stock (quantity) likhein.");
    if (!images.length) return setErrorMsg("Kam az kam ek image upload karein.");

    const data = new FormData();
    data.append("title", form.title.trim());
    data.append("desc", form.desc);
    data.append("category", form.category);
    data.append("condition", form.condition);
    data.append("price", form.price);
    data.append("stock", form.stock);
    data.append("sizes", JSON.stringify(sizes));
    // pehli image = main image (backend images[0] ko img banata hai)
    images.forEach((i) => data.append("images", i.file));

    try {
      setLoading(true);
      await axios.post(API_URL, data); // Content-Type axios khud set karega
      images.forEach((i) => URL.revokeObjectURL(i.url));
      setForm(emptyForm);
      setSizes([]);
      setImages([]);
      setFileKey((k) => k + 1);
      alert("Product create ho gaya!");
    } catch (error) {
      console.error("Create product error", error);
      setErrorMsg(error.response?.data?.error || "Product create nahi ho saka.");
    } finally {
      setLoading(false);
    }
  };

  const mainPreview = images[0]?.url;

  return (
    <section className="relative min-h-screen w-full bg-gray-900">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop)",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center p-4 md:p-8 lg:p-12">
        <div className="grid w-full max-w-6xl flex-grow grid-cols-1 items-center gap-8 p-2 md:p-6 lg:grid-cols-2">
          {/* Left: live preview */}
          <div className="flex flex-col justify-end gap-6 p-2 lg:p-6">
            <div className="max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-white/90 shadow-xl backdrop-blur-sm">
              <div className="flex aspect-[4/3] items-center justify-center bg-gray-100">
                {mainPreview ? (
                  <img src={mainPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm text-gray-400">Image preview</span>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto p-2">
                  {images.slice(1).map((i) => (
                    <img key={i.url} src={i.url} alt="" className="h-10 w-10 rounded object-cover" />
                  ))}
                </div>
              )}
              <div className="space-y-1 p-4">
                <h3 className="truncate font-semibold text-gray-900">
                  {form.title || "Product title"}
                </h3>
                <p className="line-clamp-2 text-sm text-gray-500">
                  {form.desc || "Description yahan dikhegi"}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {sizes.map((s) => (
                    <span key={s} className="rounded border border-gray-300 px-1.5 text-[11px] text-gray-600">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-bold text-indigo-600">
                    {form.price ? `Rs. ${form.price}` : "Rs. 0"}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> 0.0
                    <span className="ml-2 text-xs">Stock: {form.stock || 0}</span>
                  </span>
                </div>
              </div>
            </div>

            <h1 className="max-w-lg text-4xl font-extrabold leading-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl">
              Create Your Product
            </h1>
          </div>

          {/* Right: form */}
          <div className="w-full max-w-md rounded-lg bg-[#a7cb12] p-5 shadow-xl md:p-6 lg:justify-self-end">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label htmlFor="title" className={labelClass}>Title</label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={ChangeHadler}
                  placeholder="Product ka naam"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="category" className={labelClass}>Category</label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={ChangeHadler}
                    className={inputClass}
                  >
                    <option value="" disabled>Select Category</option>
                    <option value="Clothes">Clothes</option>
                    <option value="Tech">Tech</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Watches">Watches</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="condition" className={labelClass}>Condition</label>
                  <select
                    id="condition"
                    name="condition"
                    value={form.condition}
                    onChange={ChangeHadler}
                    className={inputClass}
                  >
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Used">Used</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="desc" className={labelClass}>Description</label>
                <textarea
                  id="desc"
                  name="desc"
                  value={form.desc}
                  onChange={ChangeHadler}
                  rows={3}
                  placeholder="Product ke baare mein likhein..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="price" className={labelClass}>Price</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={ChangeHadler}
                    placeholder="e.g. 1999"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="stock" className={labelClass}>Quantity (stock)</label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={ChangeHadler}
                    placeholder="e.g. 25"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <label className={labelClass}>
                  Sizes <span className="font-normal opacity-70">(optional)</span>
                </label>
                {[CLOTH_SIZES, SHOE_SIZES].map((group, gi) => (
                  <div key={gi} className="flex flex-wrap gap-1.5">
                    {group.map((s) => {
                      const on = sizes.includes(s);
                      return (
                        <button
                          type="button"
                          key={s}
                          onClick={() => toggleSize(s)}
                          className={`rounded-md border px-2.5 py-1 text-xs font-bold transition-colors ${
                            on
                              ? "border-[#1d2a02] bg-[#1d2a02] text-[#d9f542]"
                              : "border-[#7f9a0c] bg-[#f6fbd9] text-[#1d2a02] hover:bg-white"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomSize();
                      }
                    }}
                    placeholder="Custom size (e.g. 32, Free)"
                    className={inputClass}
                  />
                  <button type="button" onClick={addCustomSize} className={primaryBtn} aria-label="Add size">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {/* custom sizes jo presets mein nahi hain */}
                <div className="flex flex-wrap gap-1.5">
                  {sizes
                    .filter((s) => !CLOTH_SIZES.includes(s) && !SHOE_SIZES.includes(s))
                    .map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggleSize(s)}
                        className="flex items-center gap-1 rounded-md bg-[#1d2a02] px-2 py-1 text-xs font-bold text-[#d9f542]"
                      >
                        {s} <X className="h-3 w-3" />
                      </button>
                    ))}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <label className={labelClass}>
                  Images{" "}
                  <span className="font-normal opacity-70">
                    ({images.length}/{MAX_IMAGES}) — pehli image main hogi
                  </span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, i) => (
                    <div
                      key={img.url}
                      className={`group relative aspect-square overflow-hidden rounded-md border-2 ${
                        i === 0 ? "border-[#1d2a02]" : "border-transparent"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => makeMain(i)}
                        className="h-full w-full"
                        title="Main image banayein"
                      >
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-[#1d2a02] py-0.5 text-center text-[10px] font-bold text-[#d9f542]">
                          MAIN
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        aria-label="Remove image"
                        className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {images.length < MAX_IMAGES && (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-[#1d2a02]/50 bg-[#f6fbd9] text-[#1d2a02] hover:bg-white">
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-[11px] font-bold">Add</span>
                      <input
                        key={fileKey}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={ImagesHandler}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {errorMsg && <p className="text-xs font-semibold text-red-800">{errorMsg}</p>}

              <button type="submit" disabled={loading} className={`${primaryBtn} w-full`}>
                {loading ? "Uploading…" : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CreateProduct;