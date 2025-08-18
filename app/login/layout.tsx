import { Shadow } from "@/components/shadow";
import { ThemeProvider } from "@/components/theme-provider";
import { EtheralShadow } from "@/components/ui/shadcn-io/etheral-shadow";
import dynamic from "next/dynamic";

export const metadata = {
    title: "Lord Arbiter",
    description: "Weeping may endure for a night, but joy comes in the morning.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <main className="h-screen overflow-hidden relative">
            <video autoPlay loop muted playsInline className="mix-blend-lighten fixed h-full object-cover aspect-[16 / 7.38] -z-10 opacity-40"
                src={"https://rr1---sn-4pgnuhxqp5-jb3y.googlevideo.com/videoplayback?expire=1755461080&ei=eOGhaJbjG6eup-oPtszEyAU&ip=80.187.123.110&id=o-AP1p5pJvo1PQxfi1gNfOmRaWjbfkrj6g24Pq45f-r85z&itag=400&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C271%2C278%2C394%2C395%2C396%2C397%2C398%2C399%2C400%2C598&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&rms=au%2Cau&bui=AY1jyLNO2YVED-_6wvRbNhR6QWNARStYLjzIa3FogobnhEi8fNSYWODFa1geAHGw7T790yZE2gbkES6R&vprv=1&svpuc=1&mime=video%2Fmp4&ns=9sQIU6jU9wvTeuvLwkQMsRIQ&rqh=1&gir=yes&clen=31834751&dur=117.541&lmt=1754811413918221&keepalive=yes&fexp=24350590,24350737,24350827,24351316,24351318,24351528,24351691,24352220,24352559,24352568,24352573,24352576,24352578,24352697,24352699,24352882,24352884,24352944,24352946,24352960,51331020,51548755,51565116,51565682&c=MWEB&sefc=1&txp=5532534&n=TRT9ZKI7HZ_MqQ&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgUUZLGheRPwosWRRAf6_Kn3Uyug_U5dCJ-RJTU-XzUqUCIEvKC3PBy771oeHNjkKOIv5k1i4aDpac5EHn41TeqQ5f&pot=Mna_h1ZJz7qMeL-5xAcBLGyVBMZUjH45BC-uRvXscwwslgPtjaZQ-gnqR7vtkqrQ9DY6e79tMGrhuGViEAyIh97L9FJEbUUgL-bEuxeME8etZ2gFCmX26aGqs6UsJ0JZVyLcILTqmE5xSBZeN0NOKJyOP-J9vwvS&redirect_counter=1&rm=sn-4g5er676&rrc=104&req_id=9e2b63d8823a3ee&cms_redirect=yes&cmsv=e&ipbypass=yes&met=1755439509,&mh=aZ&mip=139.0.212.157&mm=31&mn=sn-4pgnuhxqp5-jb3y&ms=au&mt=1755438778&mv=u&mvi=1&pl=19&lsparams=ipbypass,met,mh,mip,mm,mn,ms,mv,mvi,pl,rms&lsig=APaTxxMwRQIhANRfTkJWa5YC620gvMS6M9Nqqcac5DeXKNT9vVO_bFDAAiBpuHhQ-dX2J3SNV0NLJkux6jWCmOMsKloPCcpOvepaww%3D%3D"}
            />
            <div className="relative min-h-screen">
                {children}
            </div>
        </main>
    );
}
