import React, { useEffect } from 'react';
import { Code, Database, Server, Globe, Github, ExternalLink } from 'lucide-react';
import Typewriter from 'typewriter-effect';

const FramerMotion = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', '-translate-y-10', 'translate-y-10', '-translate-x-10', 'translate-x-10', 'scale-95');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-animate').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-slate-900 text-white">
      <section className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-900 to-slate-900">
        <div className="scroll-animate opacity-0 translate-y-10 transition-all duration-1000 text-center max-w-3xl">
          <h1 className="text-6xl font-bold mb-6">
            MERN Stack Developer
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
           <Typewriter
           options={{
            strings:['Building full-stack applications with MongoDB, Express, React, and Node.js'],
            autoStart:true,
            loop:true,
            dealy:100,
            pauseFor:2000,
            wrapperClassName:"typewriter-text",
            cursorClassName:"typewriter-cursor",
            deleteSpeed:50
           }}
           >
           </Typewriter>
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center gap-2">
              <Github size={20} /> View Projects
            </button>
            <button className="border border-blue-600 hover:bg-blue-600/10 px-6 py-3 rounded-lg flex items-center gap-2">
              <ExternalLink size={20} /> Contact Me
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 scroll-animate opacity-0 translate-y-10 transition-all duration-1000">
            My Tech Stack
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Database size={40} />, title: "MongoDB", desc: "Database " },
              { icon: <Server size={40} />, title: "Express.js", desc: "REST API Development" },
              { icon: <Code size={40} />, title: "React.js", desc: "Frontend Development" },
              { icon: <Globe size={40} />, title: "Node.js", desc: "Backend Architecture" }
            ].map((tech, index) => (
              <div
                key={tech.title}
                className="scroll-animate opacity-0 translate-y-10 transition-all duration-1000"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="bg-slate-800 p-6 rounded-xl hover:bg-slate-700 transition-colors">
                  <div className="text-blue-500 mb-4">{tech.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{tech.title}</h3>
                  <p className="text-gray-400">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 scroll-animate opacity-0 translate-y-10 transition-all duration-1000">
            Featured Projects
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((project, index) => (
              <div
                key={project}
                className="scroll-animate opacity-0 translate-x-10 transition-all duration-1000"
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="bg-slate-800 rounded-xl overflow-hidden">
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">MERN Project {project}</h3>
                    <p className="text-gray-400 mb-4">
                      Full-stack application built with MongoDB, Express, React, and Node.js.
                      Features authentication, real-time updates, and responsive design.
                    </p>
                    <div className="flex gap-4">
                      <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2">
                        <Github size={16} /> Code
                      </button>
                      <button className="border border-blue-600 hover:bg-blue-600/10 px-4 py-2 rounded flex items-center gap-2">
                        <ExternalLink size={16} /> Live Demo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 scroll-animate opacity-0 translate-y-10 transition-all duration-1000">
            Technical Skills
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                category: "Frontend",
                skills: ["React.js", "Tailwind Css", "Html", "javaScript","React router","Context API"]
              },
              {
                category: "Backend",
                skills: ["Express.js", "REST APIs", "Socket.io", "JWT Auth","Clerk Auth","Node.js"]
              },
              {
                category: "Database",
                skills: ["MongoDB", "Mongoose", "Schema designs", "Aggregation Pipelines"]
              },{
                category:'Tools',
                skills:['Git','Github','Linux','Postman','Nmap','Wireshark',"Docker",'DSA']
              },{
                category:'Familier Laaguages',
                skills:['Python','C','javascript','Java']
              }
            ].map((skillSet, index) => (
              <div
                key={skillSet.category}
                className="scroll-animate opacity-0 scale-95 transition-all duration-1000"
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="bg-slate-800 p-6 rounded-xl">
                  <h3 className="text-xl font-bold mb-4 text-blue-400">{skillSet.category}</h3>
                  <ul className="space-y-2">
                    {skillSet.skills.map((skill) => (
                      <li key={skill} className="text-gray-300 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-3xl mx-auto text-center scroll-animate opacity-0 translate-y-10 transition-all duration-1000">
          <h2 className="text-4xl font-bold mb-8">Let's Work Together</h2>
          <p className="text-xl text-gray-300 mb-8">
            Looking for a MERN stack developer for your next project?
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg flex items-center gap-2 mx-auto">
            <ExternalLink size={20} /> Get In Touch
          </button>
        </div>
      </section>
    </div>
  );
};

export default FramerMotion;