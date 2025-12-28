
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './ImageUploader';
import { EditButton } from './EditButton';
import { ResultDisplay } from './ResultDisplay';
import { ErrorMessage } from './ErrorMessage';
import { PromptInput } from './PromptInput';
import { PreserveFaceToggle } from './PreserveFaceToggle';
import { editImageWithGemini } from '../services/geminiService';
import { addToHistory } from '../services/historyService';
import type { EditedImageResult } from '../types';

const MALE_TEMPLATES = [
  {
    label: "Cinematic Business",
    image: "https://canvasvietnam.com/images/profile1.png",
    prompt: "Cinematic high-fashion of a confident Vietnamese businessman wearing a dark navy blazer and light blue shirt without tie, standing against a clean dark studio background. Subtle softbox lighting highlights the face, creating a professional and approachable look. High-definition portrait style, natural skin tone, sharp details, business executive vibe. Medium closeup shot. IMPORTANT: Keep the original body posture and posing. The face structure and features must be preserved 100% identically to the original photo."
  },
  {
    label: "Power Suit 1",
    image: "https://canvasvietnam.com/images/profile2.png",
    prompt: "Vertical portrait, 1080x1920. Keep the same facial features. Subject wearing a black suit, white shirt with arms crossed. Stark cinematic lighting with strong contrast. Shot from a slightly low, upward angle to emphasize jawline and neck, evoking quiet dominance and sculptural elegance. Deep, saturated crimson red background for bold contrast against luminous skin and dark wardrobe. IMPORTANT: Keep the original body posture and posing. The face structure and features must be preserved 100% identically to the original photo."
  },
  {
    label: "Power Suit 2",
    image: "https://canvasvietnam.com/images/profile3.png",
    prompt: "Cinematic high-fashion of A confident Vietnamese businessman wearing a tailored dark navy suit with a white shirt and red tie. A burgundy pocket square is neatly placed in the breast pocket. He is standing upright against a plain grey studio background. His left hand is in his pocket while his right hand gently adjusts the front of his suit jacket. The posture is relaxed yet professional, showing elegance and confidence. Studio-quality portrait, sharp focus, high-definition, corporate executive style. IMPORTANT: Keep the original body posture and posing. The face structure and features must be preserved 100% identically to the original photo."
  },
  {
    label: "Modern Office",
    image: "https://canvasvietnam.com/images/profile4.png",
    prompt: "Create a Vertical portrait shot, characterized by stark cinematic lighting and intense contrast. Captured with a slightly low, upward-facing angle that dramatizes the subject's jawline and neck, the composition evokes quiet dominance and sculptural elegance. The background is a deep, saturated crimson red, creating a bold visual clash with the model's luminous skin and dark wardrobe. Lighting is tigaily directional, casting warm golden highlights on one side of the face while plunging the other into velvety shadow, emphasizing bone structure with almost architectural precision. wearing smart black suit and black shirt. shooting haft top body. IMPORTANT: Keep the original body posture and posing. The face structure and features must be preserved 100% identically to the original photo."
  },
  {
    label: "Power Suit 3",
    image: "https://canvasvietnam.com/images/profile5.png",
    prompt: "Cinematic high-fashion of A confident Vietnamese businessman in a tailored dark navy suit, crisp white shirt, and dark red textured tie. He is standing upright against a clean light grey studio background. One hand is adjusting his jacket near the lapel while the other hand adjusts the shirt cuff, creating a poised and powerful look. The posture is formal, elegant, and authoritative. Studio-quality portrait, sharp focus, high-definition, professional corporate style. IMPORTANT: Keep the original body posture and posing. The face structure and features must be preserved 100% identically to the original photo."
  },
  {
    label: "Executive Desk",
    image: "https://canvasvietnam.com/images/profile6.png",
    prompt: "High-level realistic portrait of a man from the prototype (face frame, hairstyle and person 100% according to the reference image, unchanged), a modern and high-fashion portrait of a young Asian man with messy but stylish black hair, pale skin, naturally made up on the cheeks and bridge of the nose, sweet eyes, gentle facial expression, wearing a long-sleeved white shirt and a black tie with a Prada Symbole brooch in the middle of the tie. he leaned against a minimalist dark wall casually, holding a black suit jacket over his left arm. His gaze was calm and directed straight to the viewer, tilting his head slightly, the light is soft, smooth and diffused, creating a soft silhouette and a clean aesthetic with moderate contrast. The overall color looks professional and stylish, with a focus on black, white, and soft skin tones in a studio-like setting. There are two spotlights to him and warm light, upper body elements.. IMPORTANT: Keep the original body posture and posing. The face structure and features must be preserved 100% identically to the original photo."
  },
  {
    label: "Casual Smartphone",
    image: "https://canvasvietnam.com/images/profile7.png",
    prompt: "Using my photo create me a photo of A cool and confident man stands with his hands in his pockets, leaning against a textured grey wall. Don't change anything on my face and hair. He is wearing a black suit with white shirt. His expression is serious and direct, looking straight at the viewer. Dramatic lighting from the upper right casts a sharp diagonal shadow across the wall and partially illuminates his face and upper body, creating a striking contrast between light and shadow. The overall mood is strong and masculine. IMPORTANT: Keep the original body posture and posing. The face structure and features must be preserved 100% identically to the original photo."
  },
  {
    label: "Office Hallway",
    image: "https://canvasvietnam.com/images/profile8.png",
    prompt: "Change only the background and clothes. Don’t touch my face. Ultra-realistic professional fashion photo wearing a dark navy suit with peak lapels, crisp white shirt, and slim tie. My arms crossed. Shot in a modern luxury penthouse with city lights blurred in the background. My should be visible to the waist. Cinematic depth, ARRI Alexa grading, 9:16 vertical, high-end GQ magazine cover aesthetic. IMPORTANT: Keep the original body posture and posing. The face structure and features must be preserved 100% identically to the original photo."
  },
  {
    label: "B&W Studio",
    image: "https://canvasvietnam.com/images/profile9.png",
    prompt: "Create a cinematic black and white portrait of me adjusting my tie while wearing a classic, tailored suit. I stand confidently in a studio with strong side lighting, creating high contrast. Horizontal streaks of light (like light coming through curtains) create shadows on my face and suit. The expression is calm and confident, exuding elegance and determination. High fashion photography style, highly detailed, minimal and symmetrical composition. IMPORTANT: Keep the original body posture and posing. The face structure and features must be preserved 100% identically to the original photo"
  }
];

const FEMALE_TEMPLATES = [
  {
    label: "Business Suit",
    image: "https://canvasvietnam.com/images/profilefemale1.png",
    prompt: "Cinematic high-fashion of A confident Vietnamese businesswoman wearing a tailored black suit with a white shirt. She is standing upright against a plain dark grey studio background. The posture is relaxed yet professional, showing elegance and confidence. Low-key lighting, dark background, high contrast, cinematic dramatic mood. IMPORTANT: Keep the original body posture and posing. The face structure and features must be preserved 100% identically to the original photo."
  },
  {
    label: "White Shirt",
    image: "https://canvasvietnam.com/images/profilefemale2.png",
    prompt: "A hyper-realistic editorial cinematic full body portrait of the uploaded person (preserve face 100%). Lighting & background color (locked): soft directional key at ~45° with gentle falloff; subtle opposite rim/kicker; negative fill on the shadow side; seamless cool gray→blue backdrop (allow faint circular spotlight halo behind the head), clean contrast, true-to-life color. Auto-direct distance, pose, and wardrobe to fit Me’s characteristics and gender identity while preserving the above look. • Distance/Framing (auto): head-and-shoulders to half-body; natural posture; relaxed confident hands. • Wardrobe (style learned from examples, auto): – If Me reads as male → sharp tailored black suit, crisp white shirt, optional slim black tie or open collar; polished but modern; minimal metallic jewelry. – If Me reads as female → stylish working-woman tailoring (black blazer/trouser set); allow tasteful modern variants (cropped blazer or subtle inner top) that keep it versatile for any occasion with refined, understated sensuality; minimal jewelry. Photorealistic, commercial/editorial quality; natural proportions; no text/logos/watermarks; clean studio set only."
  },
  {
    label: "Red lady",
    image: "https://canvasvietnam.com/images/profilefemale3.png",
    prompt: "A photorealistic studio portrait of the woman from the uploaded photo — keep the original face and facial expression exactly as in the uploaded image. Three-quarter length portrait of a poised young woman leaning on a modern dark table with both hands resting on the tabletop. She wears a fitted black strapless midi dress and an oversized black blazer draped over her shoulders, sleeves casually pushed up. Long glossy straight black hair pulled into a low sleek bun with a few loose face-framing strands. Natural soft-glam makeup: neutral eyeshadow, subtle eyeliner, defined brows, soft pink-mauve lips and light blush. Delicate silver jewelry: square pendant necklace, small earrings, rings on fingers. Neutral warm beige background, soft even studio lighting (softbox key from 45° left, gentle fill), shallow depth of field (85mm look), cinematic, ultra-realistic skin texture, natural shadows, high detail, photoreal, no watermark, no text. IMPORTANT: Keep the original body posture and posing. The face structure and features must be preserved 100% identically to the original photo."
  },
  {
    label: "Executive Portrait",
    image: "https://canvasvietnam.com/images/profilefemale4.png",
    prompt: "Use the uploaded photo as the model’s face reference, keep 100% facial identity. Use my picture. Create image Hands in Pockets, Relaxed Authority A hyper-realistic cinematic editorial portrait of the uploaded person (preserve face 100%). She stands tall in a dark moody studio,surrounded by soft drifting smoke under a dramatic spotlight.Outfit:Fit slate-black luxury suit with fit-leg trousers, paired with a slightly unbuttoned white silk shirt. Both hands tucked casually in pockets, shoulders relaxed, confident expression, head tilted slightly upward. IMPORTANT: Keep the original body posture and posing. The face structure and features must be preserved 100% identically to the original photo."
  },
  {
    label: "Casual Business",
    image: "https://canvasvietnam.com/images/profilefemale5.png",
    prompt: "Use the uploaded photo as the model’s face reference, keep 100% facial identity. Generate a cinematic fashion portrait of a stylish woman in a minimalist indoor setting that's suitable to be used as a business profile picture. Soft natural makeup with a warm glow, beautiful eyelashes. Long-length wavy hair, flowing naturally. light beige suit (blazer and trousers), beige vest, chic and professional yet relaxed. Small pearl earrings and minimal style pearl necklace. Golden hour sunlight coming through a large window, casting sharp rectangular patterns and soft plant shadows on the wall and her body but still can see her facial structure clearly (no shadow on her face), also can still see the difference between her hair and the shadow in the background. Warm, natural tones enhancing the beige outfit and her glowing skin. Minimalist background with soft shadows and a touch of greenery for depth. Medium shot (waist-up to upper thigh), slightly low angle for a powerful, editorial look. Effortless elegance, confidence, and modern sophistication. Relaxed yet commanding presence, exuding high-fashion editorial energy."
  },
  {
    label: "White Clear",
    image: "https://canvasvietnam.com/images/profilefemale6.png",
    prompt: "An ultra-realistic image of a businesswoman (maintain facial features as much as possible). She wears a refined white suit. She is seated on a white bench. Her arms are one above her knees, and she is looking at the camera with a fixed and serious gaze. Flawless makeup, including a light brown lip and subtle eyeliner, enhances her features. The background is simple, monochromatic white, varying from lightest to darkest, with a touch of bright light and a shadow in the background. The lighting is soft and dramatic, casting an ethereal glow on her. The image, taken with a high-quality DSLR camera such as a Canon EOS R5 with a 50mm lens, has a professional finish with a shallow depth of field, highlighting the subject. The image is natural and sharp, with focus on her face and neck. IMPORTANT: Keep the original body posture and posing. The face structure and features must be preserved 100% identically to the original photo."
  },
  {
    label: "Deep Woman",
    image: "https://canvasvietnam.com/images/profilefemale7.png",
    prompt: "Impressive cinematic portrait of a business woman. Half body shot with soft lighting style, strong contrast between darkness and warm yellow light, deep red background. The character is wearing a smart black suit and black shirt, wearing a four-leaf necklace. Cinematic composition with a slightly low angle, the face is illuminated on one side, the other side is in darkness. Rich color tone, gloomy atmosphere, extremely detailed skin texture, professional studio photography. IMPORTANT: Keep the original body posture and posing. The face structure and features must be preserved 100% identically to the original photo."
  },
  {
    label: "Deep Woman",
    image: "https://canvasvietnam.com/images/profilefemale8.png",
    prompt: "Keep cinematic editorial tones, photorealistic high detail, and modern chic vibe. Outfit: Yellow tweed short suit with gold buttons. Hairstyle: Loose sleek waves over shoulders. Pose: Sitting casually with one arm resting on the chair armrest, gentle smile directly toward the camera. Accessories: Minimal hoop earrings, subtle bracelet. Background: Soft beige-gray studio backdrop. Lighting: Warm cinematic softbox with gentle shadow. Mood: Natural, elegant, confident charm. IMPORTANT: Keep the original body posture and posing. The face structure and features must be preserved 100% identically to the original photo."
  },
  {
    label: "Deep Woman",
    image: "https://canvasvietnam.com/images/profilefemale9.png",
    prompt: "Create an elegant and confident businesswoman portrait. Outfit: silky satin dress in deep red, with a black blazer draped over shoulders. Pose: standing with one arm crossed, the other hand raised near the chest in a graceful gesture. Expression: calm, poised, professional. Accessories: delicate necklace with small pendant, silver bracelets, natural wavy hairstyle. Background: plain light gray studio backdrop with soft lighting. Style: ultra-realistic, high-quality fashion business portrait photography, LinkedIn/CEO profile style. IMPORTANT: Keep the original body posture and posing. The face structure and features must be preserved 100% identically to the original photo."
  }

];

export const ProfilePhotoTab: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File | null; base64: string | null }>({
    file: null,
    base64: null,
  });
  const [prompt, setPrompt] = useState<string>('');
  const [preserveStructure, setPreserveStructure] = useState<boolean>(true);
  const [keepOriginalClothing, setKeepOriginalClothing] = useState<boolean>(false);
  const [editedResults, setEditedResults] = useState<EditedImageResult[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [templateTab, setTemplateTab] = useState<'male' | 'female'>('male');

  const currentTemplates = templateTab === 'male' ? MALE_TEMPLATES : FEMALE_TEMPLATES;

  const handleFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage({ file, base64: reader.result as string });
        setEditedResults(null); // Clear previous results
        setError(null);
      };
      reader.onerror = () => {
        setError('Failed to read the image file.');
      };
      reader.readAsDataURL(file);
    } else {
      setOriginalImage({ file: null, base64: null });
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!originalImage.base64 || !originalImage.file) {
      setError('Please upload an image first.');
      return;
    }
    if (!prompt.trim()) {
      setError('Please enter a prompt to describe the edit.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedResults([]); // Initialize empty array

    try {
      const basePrompt = prompt.trim();
      const structureInstruction = preserveStructure
        ? " IMPORTANT: Preserve the original face and body posing exactly as in the photo. Do not change the person's facial features, expression, or body position."
        : "";

      const promptsToRun: { title: string; prompt: string }[] = [];

      if (keepOriginalClothing) {
        promptsToRun.push({
          title: 'Original Clothing',
          prompt: `${basePrompt}. Keep the original clothing.${structureInstruction}`,
        });
      }

      promptsToRun.push({
        title: 'Generated Image',
        prompt: `${basePrompt}.${structureInstruction}`,
      });


      const personBase64Data = originalImage.base64.split(',')[1];
      const personMimeType = originalImage.file.type;

      // Sequential Execution to avoid Rate Limits
      const currentResults: EditedImageResult[] = [];

      for (const p of promptsToRun) {
        try {
            const result = await editImageWithGemini(
                personBase64Data,
                personMimeType,
                p.prompt
            );

            const finalResult: EditedImageResult = {
                ...result,
                title: p.title,
                prompt: p.prompt
            };
            
            currentResults.push(finalResult);
            setEditedResults([...currentResults]); // Update UI incrementally
            
            // Save to history
            if (finalResult.imageUrl) {
                addToHistory({
                    imageUrl: finalResult.imageUrl,
                    prompt: finalResult.prompt,
                    category: 'profile'
                });
            }
        } catch (e) {
             console.error(`Failed to generate ${p.title}:`, e);
             const failedResult: EditedImageResult = {
                imageUrl: null,
                text: null,
                title: p.title,
                prompt: p.prompt
            };
            currentResults.push(failedResult);
            setEditedResults([...currentResults]);
        }
      }
      
      if (currentResults.every(r => !r.imageUrl)) {
          throw new Error("All generations failed. Please try again later.");
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate image: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, prompt, preserveStructure, keepOriginalClothing]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Controls Column */}
      <div className="lg:col-span-4 bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 h-fit">
        <div className="space-y-6">
          <ImageUploader 
            onFileChange={handleFileChange} 
            previewUrl={originalImage.base64}
            showCameraButton={true}
          />
          <div className="space-y-4">
            <PromptInput
              label="2. Describe Your Edit"
              placeholder="e.g., 'Professional headshot, blurred office background' or 'Artistic black and white portrait'"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
            />
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">
                Templates
              </label>
              <div className="flex p-1 space-x-1 bg-slate-700/50 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTemplateTab('male')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    templateTab === 'male' 
                      ? 'bg-slate-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateTab('female')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    templateTab === 'female' 
                      ? 'bg-slate-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Female
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                  {currentTemplates.map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPrompt(template.prompt)}
                      disabled={isLoading}
                      className="group relative w-full overflow-hidden rounded-lg border border-slate-700 shadow-md transition-all hover:border-cyan-500 hover:shadow-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-700 disabled:hover:shadow-md"
                      aria-label={`Apply ${template.label} prompt`}
                    >
                      <img 
                        src={template.image} 
                        alt={template.label} 
                        className="w-full aspect-[3/4] object-cover object-top transition-transform group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-1 w-full">
                        <p className="text-[10px] font-semibold text-white text-left truncate leading-tight">
                          {template.label}
                        </p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>

           <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              3. Options
            </label>
            <div className="space-y-3">
              <PreserveFaceToggle
                id="preserve-structure-profile"
                checked={preserveStructure}
                onChange={(e) => setPreserveStructure(e.target.checked)}
                disabled={isLoading}
                label="Preserve Face & Posing"
                description="Attempts to keep original face, expression, and body posture."
              />
              <PreserveFaceToggle
                id="keep-clothing-profile"
                checked={keepOriginalClothing}
                onChange={(e) => setKeepOriginalClothing(e.target.checked)}
                disabled={isLoading}
                label="Keep Original Clothing"
                description="Generates an extra version with the original outfit."
              />
            </div>
          </div>
          <EditButton 
            label="4. Generate"
            buttonText="Generate Image"
            onClick={handleGenerate} 
            isLoading={isLoading}
            disabled={!originalImage.file || !prompt.trim()}
          />
          {error && <ErrorMessage message={error} />}
        </div>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-8">
        <ResultDisplay
          originalImageUrl={originalImage.base64}
          editedResults={editedResults}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
