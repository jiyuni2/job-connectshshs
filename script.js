let currentUser = null;
let jobs = [];
let users = [];
let applications = [];
let savedJobs = [];
let reports = [];
let notifications = [];
let currentPage = 1;
let itemsPerPage = 10;
let searchHistory = [];
let isDarkMode = true;
let totalSearches = 0;

(function() {
    try {
        const key = 'jobconnect_darkMode';
        const savedTheme = localStorage.getItem(key);
        const shouldDark = savedTheme === null ? true : savedTheme === 'true';
        if (savedTheme === null) localStorage.setItem(key, 'true');
        isDarkMode = shouldDark;
        document.documentElement.classList.toggle('dark-mode', shouldDark);
        if (document.body) document.body.classList.toggle('dark-mode', shouldDark);
    } catch (e) {
        isDarkMode = true;
        document.documentElement.classList.add('dark-mode');
        if (document.body) document.body.classList.add('dark-mode');
    }
})();

function initializeApp() {
    loadFromLocalStorage();
    loadThemePreference();
    ensureHiddenFilters();
    updateNavigation();
    
    let savedPage = sessionStorage.getItem('currentPage') || 'home';
    if (currentUser && savedPage === 'home') {
        savedPage = 'jobs';
    }
    showPage(savedPage);
    
    displayJobs();
    animateHomeStats();
    
    if (currentUser && currentUser.userType === 'admin') {
        updateAdminStats();
    }
    
    initScrollAnimations();
    addParticleBackground();
}

function loadFromFiles() {
    let loadPromises = [];
    
    // Load initial jobs from file
    const jobsPromise = fetch('data/initial-jobs.json')
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                jobs = data;
                localStorage.setItem('jobconnect_jobs', JSON.stringify(jobs));
                console.log('Loaded', data.length, 'jobs from file');
            }
        })
        .catch(error => {
            console.log('Could not load jobs from file, using localStorage');
        });
    loadPromises.push(jobsPromise);
    
    // Load users from file if exists
    const usersPromise = fetch('data/users.json')
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                users = data;
                localStorage.setItem('jobconnect_users', JSON.stringify(users));
                console.log('Loaded', data.length, 'users from file');
            }
        })
        .catch(error => {
            console.log('Could not load users from file');
        });
    loadPromises.push(usersPromise);
    
    // Load applications from file if exists
    const applicationsPromise = fetch('data/applications.json')
        .then(response => response.json())
        .then(data => {
            if (data) {
                applications = data;
                localStorage.setItem('jobconnect_applications', JSON.stringify(applications));
                console.log('Loaded applications from file');
            }
        })
        .catch(error => {
            console.log('Could not load applications from file');
        });
    loadPromises.push(applicationsPromise);
    
    // Load saved jobs from file if exists
    const savedJobsPromise = fetch('data/savedJobs.json')
        .then(response => response.json())
        .then(data => {
            if (data) {
                savedJobs = data;
                localStorage.setItem('jobconnect_savedJobs', JSON.stringify(savedJobs));
                console.log('Loaded saved jobs from file');
            }
        })
        .catch(error => {
            console.log('Could not load saved jobs from file');
        });
    loadPromises.push(savedJobsPromise);
    
    // Return promise to know when all data is loaded
    return Promise.all(loadPromises);
}

function loadFromLocalStorage() {
    const savedUsers = localStorage.getItem('jobconnect_users');
    const savedJobs = localStorage.getItem('jobconnect_jobs');
    const savedCurrentUser = localStorage.getItem('jobconnect_currentUser');
    const savedApplications = localStorage.getItem('jobconnect_applications');
    const savedSavedJobsData = localStorage.getItem('jobconnect_savedJobs');
    
    // Load from files first
    loadFromFiles();
    
    if (savedUsers) {
        users = JSON.parse(savedUsers);
        const adminIndex = users.findIndex(u => u.email === 'admin@jobconnect.com' || u.userType === 'admin');
        if (adminIndex > -1) {
            users[adminIndex].email = 'admin@jobconnect.com';
            users[adminIndex].userType = 'admin';
            users[adminIndex].password = '37595937';
        }
    } else {
        users = [
            {
                id: 'admin001',
                name: 'Admin',
                email: 'admin@jobconnect.com',
                password: '37595937',
                phone: '555-0000',
                userType: 'admin'
            }
        ];
        saveToLocalStorage();
    }
    
    if (savedJobs) {
        jobs = JSON.parse(savedJobs);
    } else {
        jobs = [
            {
                id: 'job001',
                title: 'Senior Software Engineer',
                description: 'We are looking for an experienced software engineer to join our team. You will be responsible for developing and maintaining web applications using modern technologies.',
                requirements: 'Bachelor\'s degree in Computer Science, 5+ years experience, proficiency in JavaScript, React, Node.js',
                type: 'Full-time',
                salary: 120000,
                city: 'Hargeisa',
                contact: 'hr@techcorp.com',
                company: 'TechCorp Inc.',
                category: 'Technology',
                experience: '6-10 years',
                remote: 'false',
                employerId: 'admin001',
                postedDate: new Date().toISOString(),
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 2,
                status: 'active',
                views: 45,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job002',
                title: 'Marketing Manager',
                description: 'Join our marketing team to lead campaigns and drive brand awareness. Experience in digital marketing and team management required.',
                requirements: 'MBA preferred, 3+ years in marketing, strong leadership skills',
                type: 'Full-time',
                salary: 85000,
                city: 'Borama',
                contact: 'careers@marketpro.com',
                company: 'MarketPro',
                category: 'Marketing',
                experience: '3-5 years',
                remote: 'false',
                employerId: 'admin001',
                postedDate: new Date().toISOString(),
                deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 1,
                status: 'active',
                views: 32,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job003',
                title: 'Graphic Designer',
                description: 'Creative graphic designer needed for various design projects. Must be proficient in Adobe Creative Suite and have a strong portfolio.',
                requirements: 'Portfolio required, Adobe Creative Suite mastery, 2+ years experience',
                type: 'Part-time',
                salary: 45000,
                city: 'Berbera',
                contact: 'design@creativestudio.com',
                company: 'Creative Studio',
                category: 'Design',
                experience: '0-2 years',
                remote: 'true',
                employerId: 'admin001',
                postedDate: new Date().toISOString(),
                deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 1,
                status: 'active',
                views: 28,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job004',
                title: 'Data Analyst',
                description: 'Analyze data trends and provide insights to drive business decisions. Experience with SQL, Python, and data visualization tools required.',
                requirements: 'SQL, Python, Tableau/PowerBI, statistical analysis skills',
                type: 'Full-time',
                salary: 75000,
                city: 'Burco',
                contact: 'jobs@datainsights.com',
                company: 'Data Insights LLC',
                category: 'Technology',
                experience: '3-5 years',
                remote: 'hybrid',
                employerId: 'admin001',
                postedDate: new Date().toISOString(),
                deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 3,
                status: 'active',
                views: 51,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job005',
                title: 'Registered Nurse',
                description: 'Provide quality patient care in our modern healthcare facility. Must have valid nursing license and excellent communication skills.',
                requirements: 'Valid RN license, 2+ years experience, BLS certification',
                type: 'Full-time',
                salary: 65000,
                city: 'Hargeisa',
                contact: 'hr@healthcarecenter.com',
                company: 'Healthcare Center',
                category: 'Healthcare',
                experience: '3-5 years',
                remote: 'false',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 5,
                status: 'active',
                views: 67,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job006',
                title: 'Sales Representative',
                description: 'Drive sales growth and build client relationships. Experience in B2B sales preferred. Excellent commission structure.',
                requirements: 'Sales experience, excellent communication, self-motivated',
                type: 'Full-time',
                salary: 55000,
                city: 'Borama',
                contact: 'sales@salesforce.com',
                company: 'SalesForce Solutions',
                category: 'Sales',
                experience: '0-2 years',
                remote: 'false',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 3,
                status: 'active',
                views: 42,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job007',
                title: 'Elementary School Teacher',
                description: 'Teach elementary students in a supportive environment. Create engaging lesson plans and foster student development.',
                requirements: 'Teaching degree, classroom management experience, passion for education',
                type: 'Full-time',
                salary: 48000,
                city: 'Gabilay',
                contact: 'principal@brightfuture.edu',
                company: 'Bright Future School',
                category: 'Education',
                experience: 'Mid Level',
                remote: 'false',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 2,
                status: 'active',
                views: 38,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job008',
                title: 'Financial Analyst',
                description: 'Analyze financial data, prepare reports, and provide strategic recommendations. Strong Excel and financial modeling skills required.',
                requirements: 'Finance degree, Excel expert, financial modeling, 3+ years experience',
                type: 'Full-time',
                salary: 82000,
                city: 'Hargeisa',
                contact: 'careers@financecorp.com',
                company: 'Finance Corp',
                category: 'Finance',
                experience: 'Senior Level',
                remote: 'hybrid',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 1,
                status: 'active',
                views: 55,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job009',
                title: 'Customer Service Representative',
                description: 'Provide excellent customer support via phone, email, and chat. Help customers resolve issues and answer questions.',
                requirements: 'Excellent communication, problem-solving skills, customer service experience',
                type: 'Full-time',
                salary: 38000,
                city: 'Berbera',
                contact: 'hr@customercare.com',
                company: 'CustomerCare Solutions',
                category: 'Customer Service',
                experience: 'Entry Level',
                remote: 'true',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 10,
                status: 'active',
                views: 89,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job010',
                title: 'UX/UI Designer',
                description: 'Design beautiful and intuitive user interfaces for web and mobile applications. Work with product team to create amazing user experiences.',
                requirements: 'Figma/Sketch expert, portfolio required, user research experience',
                type: 'Contract',
                salary: 95000,
                city: 'Hargeisa',
                contact: 'design@designstudio.com',
                company: 'Modern Design Studio',
                category: 'Design',
                experience: 'Senior Level',
                remote: 'true',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 2,
                status: 'active',
                views: 73,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job011',
                title: 'Mechanical Engineer',
                description: 'Design and develop mechanical systems for industrial projects. CAD experience and engineering degree required.',
                requirements: 'Engineering degree, AutoCAD, SolidWorks, 4+ years experience',
                type: 'Full-time',
                salary: 88000,
                city: 'Borama',
                contact: 'engineering@industrial.com',
                company: 'Industrial Solutions',
                category: 'Engineering',
                experience: 'Senior Level',
                remote: 'false',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 2,
                status: 'active',
                views: 44,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job012',
                title: 'Content Writer',
                description: 'Create engaging content for blogs, social media, and marketing materials. Strong writing skills and creativity required.',
                requirements: 'Excellent writing, SEO knowledge, portfolio of published work',
                type: 'Freelance',
                salary: 42000,
                city: 'Hargeisa',
                contact: 'content@mediahouse.com',
                company: 'Media House',
                category: 'Marketing',
                experience: 'Entry Level',
                remote: 'true',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 4,
                status: 'active',
                views: 61,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job013',
                title: 'DevOps Engineer',
                description: 'Manage cloud infrastructure, CI/CD pipelines, and deployment automation. AWS/Azure experience required.',
                requirements: 'AWS/Azure certified, Docker, Kubernetes, Jenkins, 5+ years experience',
                type: 'Full-time',
                salary: 115000,
                city: 'Berbera',
                contact: 'devops@cloudtech.com',
                company: 'CloudTech Systems',
                category: 'Technology',
                experience: 'Senior Level',
                remote: 'true',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 1,
                status: 'active',
                views: 92,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job014',
                title: 'Accountant',
                description: 'Handle accounts payable/receivable, financial reporting, and tax preparation. CPA preferred.',
                requirements: 'Accounting degree, QuickBooks, Excel, attention to detail',
                type: 'Full-time',
                salary: 58000,
                city: 'Burco',
                contact: 'accounting@financefirm.com',
                company: 'Finance & Accounting Firm',
                category: 'Finance',
                experience: 'Mid Level',
                remote: 'false',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 2,
                status: 'active',
                views: 47,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job015',
                title: 'Human Resources Manager',
                description: 'Lead HR department, manage recruitment, employee relations, and policy development. Strategic HR experience required.',
                requirements: 'HR degree, 5+ years HR experience, leadership skills, SHRM certification preferred',
                type: 'Full-time',
                salary: 72000,
                city: 'Hargeisa',
                contact: 'hr@corporatehq.com',
                company: 'Corporate HQ',
                category: 'Other',
                experience: 'Senior Level',
                remote: 'false',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 1,
                status: 'active',
                views: 58,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job016',
                title: 'Social Media Manager',
                description: 'Manage social media presence across all platforms. Create content, engage with audience, and analyze metrics.',
                requirements: 'Social media expertise, content creation, analytics, 2+ years experience',
                type: 'Full-time',
                salary: 52000,
                city: 'Borama',
                contact: 'social@digitalagency.com',
                company: 'Digital Marketing Agency',
                category: 'Marketing',
                experience: 'Mid Level',
                remote: 'hybrid',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 1,
                status: 'active',
                views: 71,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job017',
                title: 'Mobile App Developer',
                description: 'Build native mobile applications for iOS and Android. Experience with React Native or Flutter required.',
                requirements: 'React Native/Flutter, JavaScript, mobile development, 3+ years',
                type: 'Full-time',
                salary: 98000,
                city: 'Hargeisa',
                contact: 'mobile@appdev.com',
                company: 'App Development Inc',
                category: 'Technology',
                experience: 'Mid Level',
                remote: 'true',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 2,
                status: 'active',
                views: 84,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job018',
                title: 'Project Manager',
                description: 'Lead cross-functional teams to deliver projects on time and within budget. PMP certification preferred.',
                requirements: 'PMP certification, 5+ years PM experience, Agile/Scrum knowledge',
                type: 'Full-time',
                salary: 92000,
                city: 'Berbera',
                contact: 'pm@projectpro.com',
                company: 'ProjectPro Consulting',
                category: 'Other',
                experience: 'Senior Level',
                remote: 'hybrid',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 1,
                status: 'active',
                views: 66,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job019',
                title: 'Cybersecurity Specialist',
                description: 'Protect company systems from cyber threats. Monitor security, conduct audits, and implement security measures.',
                requirements: 'Security certifications (CISSP/CEH), penetration testing, 4+ years',
                type: 'Full-time',
                salary: 105000,
                city: 'Hargeisa',
                contact: 'security@securetech.com',
                company: 'SecureTech Solutions',
                category: 'Technology',
                experience: 'Senior Level',
                remote: 'hybrid',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 2,
                status: 'active',
                views: 78,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job020',
                title: 'Video Editor',
                description: 'Edit video content for marketing campaigns, social media, and corporate videos. Adobe Premiere Pro expertise required.',
                requirements: 'Adobe Premiere Pro, After Effects, portfolio required, 2+ years',
                type: 'Part-time',
                salary: 46000,
                city: 'Burco',
                contact: 'video@creativemedia.com',
                company: 'Creative Media Productions',
                category: 'Design',
                experience: 'Mid Level',
                remote: 'true',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 1,
                status: 'active',
                views: 52,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job021',
                title: 'Business Development Executive',
                description: 'Identify new business opportunities, build partnerships, and drive revenue growth. Strong networking skills essential.',
                requirements: 'Business degree, sales experience, networking skills, 3+ years',
                type: 'Full-time',
                salary: 78000,
                city: 'Hargeisa',
                contact: 'bd@businessgrowth.com',
                company: 'Business Growth Partners',
                category: 'Sales',
                experience: 'Mid Level',
                remote: 'false',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 2,
                status: 'active',
                views: 63,
                applicationCount: 0,
                isSample: true
            },
            {
                id: 'job022',
                title: 'Quality Assurance Tester',
                description: 'Test software applications, identify bugs, and ensure quality standards. Experience with automated testing tools preferred.',
                requirements: 'Testing experience, Selenium/Jest, attention to detail, 2+ years',
                type: 'Full-time',
                salary: 62000,
                city: 'Gabilay',
                contact: 'qa@softwareqa.com',
                company: 'Software QA Labs',
                category: 'Technology',
                experience: 'Mid Level',
                remote: 'hybrid',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 3,
                status: 'active',
                views: 49,
                applicationCount: 0
            },
            {
                id: 'job023',
                title: 'Executive Assistant',
                description: 'Provide high-level administrative support to executives. Manage schedules, coordinate meetings, and handle correspondence.',
                requirements: 'Executive support experience, excellent organization, MS Office expert',
                type: 'Full-time',
                salary: 54000,
                city: 'Borama',
                contact: 'exec@corporateoffice.com',
                company: 'Corporate Office Solutions',
                category: 'Other',
                experience: 'Mid Level',
                remote: 'false',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 1,
                status: 'active',
                views: 56,
                applicationCount: 0
            },
            {
                id: 'job024',
                title: 'Digital Marketing Specialist',
                description: 'Plan and execute digital marketing campaigns across multiple channels. Google Ads and Facebook Ads experience required.',
                requirements: 'Google Ads certified, Facebook Ads, SEO/SEM, analytics, 3+ years',
                type: 'Full-time',
                salary: 68000,
                city: 'Hargeisa',
                contact: 'marketing@digitalexperts.com',
                company: 'Digital Marketing Experts',
                category: 'Marketing',
                experience: 'Mid Level',
                remote: 'true',
                employerId: 'admin001',
                postedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                vacancies: 2,
                status: 'active',
                views: 81,
                applicationCount: 0
            }
        ];
        saveToLocalStorage();
    }
    
    if (savedCurrentUser) {
        currentUser = JSON.parse(savedCurrentUser);
    }
    
    if (savedApplications) {
        applications = JSON.parse(savedApplications);
    }
    
    if (savedSavedJobsData) {
        savedJobs = JSON.parse(savedSavedJobsData);
    }
    
    const savedReports = localStorage.getItem('jobconnect_reports');
    if (savedReports) {
        reports = JSON.parse(savedReports);
    }
    
    const savedNotifications = localStorage.getItem('jobconnect_notifications');
    if (savedNotifications) {
        notifications = JSON.parse(savedNotifications);
    }
    
    const savedSearchHistory = localStorage.getItem('jobconnect_searchHistory');
    if (savedSearchHistory) {
        searchHistory = JSON.parse(savedSearchHistory);
    }
}

function saveToFiles() {
    // Save jobs to file
    fetch('data/jobs.json', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobs, null, 2)
    }).catch(error => console.log('Could not save jobs to file'));
    
    // Save users to file
    fetch('data/users.json', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(users, null, 2)
    }).catch(error => console.log('Could not save users to file'));
    
    // Save applications to file
    fetch('data/applications.json', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(applications, null, 2)
    }).catch(error => console.log('Could not save applications to file'));
    
    // Save saved jobs to file
    fetch('data/savedJobs.json', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(savedJobs, null, 2)
    }).catch(error => console.log('Could not save saved jobs to file'));
}

function saveToLocalStorage() {
    localStorage.setItem('jobconnect_users', JSON.stringify(users));
    localStorage.setItem('jobconnect_jobs', JSON.stringify(jobs));
    localStorage.setItem('jobconnect_currentUser', JSON.stringify(currentUser));
    localStorage.setItem('jobconnect_applications', JSON.stringify(applications));
    localStorage.setItem('jobconnect_savedJobs', JSON.stringify(savedJobs));
    localStorage.setItem('jobconnect_reports', JSON.stringify(reports));
    localStorage.setItem('jobconnect_notifications', JSON.stringify(notifications));
    localStorage.setItem('jobconnect_searchHistory', JSON.stringify(searchHistory));
    
    // Also save to files for persistence
    saveToFiles();
}

function showPage(pageName) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(pageName + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
        sessionStorage.setItem('currentPage', pageName);
        
        if (pageName === 'home') {
            animateHomeStats();
        } else if (pageName === 'dashboard') {
            updateDashboard();
        } else if (pageName === 'jobs') {
            displayJobs();
            totalSearches++;
            localStorage.setItem('jobconnect_totalSearches', totalSearches);
        } else if (pageName === 'admin') {
            if (currentUser && currentUser.userType === 'admin') {
                displayAdminJobs();
                updateAdminStats();
                displayAdminUsers();
                displayAdminReports();
            } else {
                showNotification('Access denied. Admin only.', 'error');
                showPage('home');
            }
        } else if (pageName === 'profile') {
            if (currentUser) {
                loadProfile();
            } else {
                showNotification('Please login to view your profile', 'error');
                showPage('login');
            }
        } else if (pageName === 'savedJobs') {
            if (currentUser && currentUser.userType === 'jobseeker') {
                displaySavedJobs();
            } else {
                showNotification('Please login as a job seeker', 'error');
                showPage('login');
            }
        } else if (pageName === 'manageApplications') {
            if (currentUser && currentUser.userType === 'employer') {
                displayManageApplications();
            } else {
                showNotification('Access denied. Employers only.', 'error');
                showPage('dashboard');
            }
        } else if (pageName === 'postJob') {
            if (!currentUser || (currentUser.userType !== 'employer' && currentUser.userType !== 'admin')) {
                showNotification('Only employers can post jobs', 'error');
                showPage('login');
            }
        }
    }
    
    window.scrollTo(0, 0);
}

function updateNavigation() {
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');
    const dashboardLink = document.getElementById('dashboardLink');
    const jobsLink = document.getElementById('jobsLink');
    const adminLink = document.getElementById('adminLink');
    const savedJobsLink = document.getElementById('savedJobsLink');
    const profileLink = document.getElementById('profileLink');
    const getStartedBtn = document.getElementById('getStartedBtn');
    
    if (currentUser) {
        loginLink.style.display = 'none';
        logoutLink.style.display = 'block';
        dashboardLink.style.display = 'block';
        jobsLink.style.display = 'block';
        profileLink.style.display = 'block';
        if (getStartedBtn) getStartedBtn.style.display = 'none';
        
        if (currentUser.userType === 'jobseeker') {
            savedJobsLink.style.display = 'block';
        } else {
            savedJobsLink.style.display = 'none';
        }
        
        if (currentUser.userType === 'admin') {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
    } else {
        loginLink.style.display = 'block';
        logoutLink.style.display = 'none';
        dashboardLink.style.display = 'none';
        jobsLink.style.display = 'block';
        adminLink.style.display = 'none';
        savedJobsLink.style.display = 'none';
        profileLink.style.display = 'none';
        if (getStartedBtn) getStartedBtn.style.display = 'block';
    }
}

function handleSignup(event) {
    event.preventDefault();
    
    // Security: Check rate limiting
    if (!securityManager.checkRateLimit('client-ip', 'signup')) {
        showNotification('Too many signup attempts. Please try again later.', 'error');
        return;
    }
    
    const name = securityManager.sanitizeInput(document.getElementById('signupName').value.trim());
    const email = securityManager.validateEmail(document.getElementById('signupEmail').value.trim().toLowerCase());
    const password = securityManager.validatePassword(document.getElementById('signupPassword').value);
    const phone = securityManager.validatePhone(document.getElementById('signupPhone').value.trim());
    const userType = document.getElementById('signupUserType').value;
    
    // Security: Validate inputs
    if (!name || name.length < 2 || name.length > 50) {
        showNotification('Invalid name. Please use 2-50 characters.', 'error');
        return;
    }
    
    if (!email) {
        showNotification('Invalid email address.', 'error');
        return;
    }
    
    if (!password) {
        showNotification('Password must be at least 8 characters with uppercase, lowercase, number, and special character.', 'error');
        return;
    }
    
    if (!phone) {
        showNotification('Invalid phone number.', 'error');
        return;
    }
    
    if (users.some(u => u.email === email)) {
        showNotification('Email already registered', 'error');
        return;
    }
    
    const newUser = {
        id: 'user' + Date.now(),
        name,
        email,
        password, // In production, this should be hashed
        phone,
        userType,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };
    
    users.push(newUser);
    currentUser = securityManager.createSecureSession(newUser);
    saveToLocalStorage();
    
    showNotification('Account created successfully!', 'success');
    updateNavigation();
    showPage('jobs');
    
    document.getElementById('signupForm').reset();
}

function handleLogin(event) {
    event.preventDefault();
    
    // Security: Check rate limiting
    if (!securityManager.checkRateLimit('client-ip', 'login')) {
        showNotification('Too many login attempts. Please try again later.', 'error');
        return;
    }
    
    const email = securityManager.validateEmail(document.getElementById('loginEmail').value.trim().toLowerCase());
    const password = securityManager.sanitizeInput(document.getElementById('loginPassword').value);
    
    // Security: Validate inputs
    if (!email) {
        showNotification('Invalid email address.', 'error');
        return;
    }
    
    if (!password || password.length < 1) {
        showNotification('Password is required.', 'error');
        return;
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Security: Update last login and create secure session
        user.lastLogin = new Date().toISOString();
        currentUser = securityManager.createSecureSession(user);
        saveToLocalStorage();
        
        // Security: Clear failed login attempts
        securityManager.suspiciousIPs.delete('client-ip');
        
        showNotification('Welcome back, ' + user.name + '!', 'success');
        updateNavigation();
        showPage('jobs');
        document.getElementById('loginForm').reset();
    } else {
        // Security: Track failed login attempt
        window.postMessage({ type: 'login_attempt', success: false }, '*');
        showNotification('Invalid email or password', 'error');
    }
}

function logout() {
    currentUser = null;
    saveToLocalStorage();
    updateNavigation();
    showNotification('Logged out successfully', 'success');
    showPage('home');
}

function handlePostJob(event) {
    event.preventDefault();
    
    // Security: Check rate limiting
    if (!securityManager.checkRateLimit('client-ip', 'postjob')) {
        showNotification('Too many job postings. Please try again later.', 'error');
        return;
    }
    
    if (!currentUser || (currentUser.userType !== 'employer' && currentUser.userType !== 'admin')) {
        showNotification('Only employers can post jobs', 'error');
        return;
    }
    
    const editJobId = document.getElementById('editJobId').value;
    const title = securityManager.validateJobTitle(document.getElementById('jobTitle').value.trim());
    const description = securityManager.validateTextArea(document.getElementById('jobDescription').value.trim(), 2000);
    const requirements = securityManager.validateTextArea(document.getElementById('jobRequirements').value.trim(), 1000);
    const type = document.getElementById('jobType').value;
    const salary = securityManager.validateSalary(document.getElementById('jobSalary').value);
    const city = document.getElementById('jobCity').value;
    const contact = securityManager.validatePhone(document.getElementById('jobContact').value.trim());
    const company = securityManager.sanitizeInput(document.getElementById('jobCompany').value.trim());
    const category = document.getElementById('jobCategory').value;
    const experience = document.getElementById('jobExperience').value;
    const remote = document.getElementById('jobRemote').value;
    const deadline = document.getElementById('jobDeadline').value;
    const vacancies = parseInt(document.getElementById('jobVacancies').value) || 1;
    
    // Security: Validate all inputs
    if (!title) {
        showNotification('Invalid job title. Please use 3-100 characters.', 'error');
        return;
    }
    
    if (!description) {
        showNotification('Invalid job description. Please use 10-2000 characters.', 'error');
        return;
    }
    
    if (!requirements) {
        showNotification('Invalid requirements. Please use 10-1000 characters.', 'error');
        return;
    }
    
    if (!salary || salary < 0 || salary > 1000000) {
        showNotification('Invalid salary amount.', 'error');
        return;
    }
    
    if (!contact) {
        showNotification('Invalid contact information.', 'error');
        return;
    }
    
    if (!company || company.length < 2 || company.length > 100) {
        showNotification('Invalid company name.', 'error');
        return;
    }
    
    if (!deadline || new Date(deadline) < new Date()) {
        showNotification('Invalid deadline date.', 'error');
        return;
    }
    
    if (vacancies < 1 || vacancies > 100) {
        showNotification('Invalid number of vacancies (1-100).', 'error');
        return;
    }
    
    if (editJobId) {
        const jobIndex = jobs.findIndex(j => j.id === editJobId);
        if (jobIndex !== -1) {
            jobs[jobIndex] = {
                ...jobs[jobIndex],
                title,
                description,
                requirements,
                type,
                salary,
                city,
                contact,
                company,
                category,
                experience,
                remote,
                deadline,
                vacancies
            };
            showNotification('Job updated successfully!', 'success');
        }
    } else {
        const newJob = {
            id: 'job' + Date.now(),
            title,
            description,
            requirements,
            type,
            salary,
            city,
            contact,
            company,
            category,
            experience,
            remote,
            employerId: currentUser.id,
            postedDate: new Date().toISOString(),
            deadline,
            vacancies,
            status: 'active',
            views: 0,
            applicationCount: 0
        };
        
        jobs.push(newJob);
        showNotification('Job posted successfully!', 'success');
    }
    
    saveToLocalStorage();
    document.getElementById('postJobForm').reset();
    document.getElementById('editJobId').value = '';
    document.getElementById('submitJobBtn').textContent = 'Post Job';
    showPage('dashboard');
}

function displayJobs(filteredJobs = null) {
    const jobListings = document.getElementById('jobListings');
    const jobsToDisplay = filteredJobs || jobs.filter(j => j.status === 'active');
    
    if (jobsToDisplay.length === 0) {
        jobListings.innerHTML = `
            <div class="empty-state">
                <h3>No jobs found</h3>
                <p>Try adjusting your filters or check back later for new opportunities</p>
            </div>
        `;
        return;
    }
    
    jobListings.innerHTML = jobsToDisplay.map(job => {
        const isSaved = currentUser && savedJobs.some(sj => sj.userId === currentUser.id && sj.jobId === job.id);
        const isOwner = currentUser && job.employerId === currentUser.id;
        const hasApplied = currentUser && applications.some(app => app.applicantId === currentUser.id && app.jobId === job.id);
        
        const remoteIcon = job.remote === 'true' ? '🏠 Remote' : job.remote === 'hybrid' ? '🔄 Hybrid' : '🏢 On-site';
        
        return `
        <div class="job-card">
            <div class="job-header">
                <div>
                    <h3 class="job-title">${job.title}</h3>
                    <p class="job-company">${job.company}</p>
                    <div class="job-meta">
                        <span class="badge badge-primary">${job.category || 'Other'}</span>
                        <span class="badge badge-success">${job.experience || 'Any Level'}</span>
                    </div>
                </div>
                <div>
                    <div class="job-salary">$${job.salary.toLocaleString()}/month</div>
                    ${currentUser && currentUser.userType === 'jobseeker' ? `
                        <button class="icon-btn" onclick="toggleSaveJob('${job.id}')" title="${isSaved ? 'Remove from saved' : 'Save job'}">
                            ${isSaved ? '⭐' : '☆'}
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="job-details">
                <div class="job-detail-item"><span>📍</span><span>${job.city}</span></div>
                <div class="job-detail-item"><span>💼</span><span>${job.type}</span></div>
                <div class="job-detail-item"><span>${remoteIcon}</span></div>
                ${job.deadline ? `<div class="job-detail-item"><span>📅</span><span>Deadline: ${new Date(job.deadline).toLocaleDateString()}</span></div>` : ''}
            </div>
            <p class="job-description">${job.description.substring(0, 200)}${job.description.length > 200 ? '...' : ''}</p>
            <div class="job-stats">
                <span>👁️ ${job.views || 0} views</span>
                <span>📝 ${job.applicationCount || 0} applications</span>
                ${job.vacancies ? `<span>👥 ${job.vacancies} ${job.vacancies === 1 ? 'position' : 'positions'}</span>` : ''}
            </div>
            <div class="job-actions">
                ${!isOwner && currentUser && currentUser.userType === 'jobseeker' ? `
                    <button class="btn btn-primary" onclick="openApplyModal('${job.id}')" ${hasApplied ? 'disabled' : ''}>
                        ${hasApplied ? 'Already Applied' : 'Apply Now'}
                    </button>
                ` : ''}
                <button class="btn btn-primary" onclick="viewJobDetails('${job.id}')">View Details</button>
                ${isOwner ? `
                    <button class="btn btn-warning" onclick="editJob('${job.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteJob('${job.id}')">Delete</button>
                ` : ''}
                ${currentUser && currentUser.userType === 'admin' && !isOwner ? `
                    <button class="btn btn-danger" onclick="adminDeleteJob('${job.id}')">🗑️ Admin Delete</button>
                ` : ''}
                ${currentUser && !isOwner && currentUser.userType !== 'admin' ? `
                    <button class="btn btn-danger" onclick="openReportModal('${job.id}')">Report</button>
                ` : ''}
            </div>
        </div>
    `}).join('');
}

function filterJobs() {
    const keyword = document.getElementById('searchKeyword')?.value.toLowerCase() || '';
    const city = getFilterValue('filterCity');
    const jobType = getFilterValue('filterJobType');
    const category = getFilterValue('filterCategory');
    const experience = getFilterValue('filterExperience');
    const salaryMin = parseInt(document.getElementById('filterSalaryMin')?.value) || 0;
    const salaryMax = parseInt(document.getElementById('filterSalaryMax')?.value) || Infinity;
    const remote = getFilterValue('filterRemote');
    const sortBy = document.getElementById('sortBy')?.value || 'date-desc';
    
    const selectedJobTypes = Array.from(document.querySelectorAll('.filter-checkbox input[type="checkbox"]:checked')).map(cb => cb.value);
    
    let filtered = jobs.filter(job => {
        if (job.status !== 'active') return false;
        
        const keywordMatch = !keyword || 
            job.title.toLowerCase().includes(keyword) ||
            job.company.toLowerCase().includes(keyword) ||
            job.description.toLowerCase().includes(keyword);
        
        const cityMatch = !city || job.city === city;
        
        const typeMatch = selectedJobTypes.length === 0 || selectedJobTypes.includes(job.type) || (!jobType || job.type === jobType);
        
        const categoryMatch = !category || job.category === category;
        const experienceMatch = !experience || job.experience === experience;
        const salaryMatch = job.salary >= salaryMin && job.salary <= salaryMax;
        const remoteMatch = !remote || job.remote === remote;
        
        return keywordMatch && cityMatch && typeMatch && categoryMatch && 
               experienceMatch && salaryMatch && remoteMatch;
    });
    
    filtered.sort((a, b) => {
        switch(sortBy) {
            case 'date-desc':
                return new Date(b.postedDate) - new Date(a.postedDate);
            case 'date-asc':
                return new Date(a.postedDate) - new Date(b.postedDate);
            case 'salary-desc':
                return b.salary - a.salary;
            case 'salary-asc':
                return a.salary - b.salary;
            case 'title-asc':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });
    
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `Showing ${filtered.length} job${filtered.length !== 1 ? 's' : ''}`;
    }
    
    displayJobs(filtered);
}

function clearFilters() {
    if (document.getElementById('searchKeyword')) document.getElementById('searchKeyword').value = '';
    
    if (document.getElementById('filterCity')) document.getElementById('filterCity').value = '';
    if (document.getElementById('filterJobType')) document.getElementById('filterJobType').value = '';
    if (document.getElementById('filterCategory')) document.getElementById('filterCategory').value = '';
    if (document.getElementById('filterExperience')) document.getElementById('filterExperience').value = '';
    if (document.getElementById('filterSalaryMin')) document.getElementById('filterSalaryMin').value = '';
    if (document.getElementById('filterSalaryMax')) document.getElementById('filterSalaryMax').value = '';
    if (document.getElementById('filterRemote')) document.getElementById('filterRemote').value = '';
    if (document.getElementById('sortBy')) document.getElementById('sortBy').value = 'date-desc';
    
    document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
    document.querySelectorAll('.filter-chip[data-city=""]').forEach(chip => chip.classList.add('active'));
    document.querySelectorAll('.filter-chip[data-category=""]').forEach(chip => chip.classList.add('active'));
    document.querySelectorAll('.filter-chip[data-exp=""]').forEach(chip => chip.classList.add('active'));
    document.querySelectorAll('.filter-chip[data-remote=""]').forEach(chip => chip.classList.add('active'));
    
    document.querySelectorAll('.filter-checkbox input[type="checkbox"]').forEach(cb => cb.checked = false);
    
    hideSearchSuggestions();
    updateActiveFilters();
    displayJobs();
}

function viewJobDetails(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    const modal = document.getElementById('jobDetailModal');
    const content = document.getElementById('jobDetailContent');
    
    // Check if current user has applied to this job
    const hasApplied = currentUser && applications.some(app => 
        app.jobId === jobId && app.applicantId === currentUser.id
    );
    
    // Show WhatsApp only if user has applied
    const contactInfo = hasApplied ? `
        <h3 style="margin-top: 2rem; margin-bottom: 1rem;">Contact Information</h3>
        <p style="color: var(--text-secondary);">📱 WhatsApp: <strong>${job.contact}</strong></p>
        <p style="color: var(--text-secondary);">📍 ${job.city}</p>
        <p style="color: var(--success-color); font-size: 0.9rem; margin-top: 0.5rem;">✓ Contact information visible because you applied</p>
    ` : `
        <h3 style="margin-top: 2rem; margin-bottom: 1rem;">Contact Information</h3>
        <p style="color: var(--text-secondary);">📍 ${job.city}</p>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">💡 Apply to see employer's WhatsApp number</p>
    `;
    
    content.innerHTML = `
        <h2>${job.title}</h2>
        <p class="job-company" style="margin-bottom: 1.5rem;">${job.company}</p>
        
        <div class="job-meta">
            <span class="badge badge-primary">${job.type}</span>
            <span class="badge badge-success">$${job.salary.toLocaleString()}/month</span>
            <span class="badge badge-warning">${job.city}</span>
            <span class="badge badge-info">${job.experience}</span>
        </div>
        
        <h3 style="margin-top: 2rem; margin-bottom: 1rem;">Job Description</h3>
        <p style="line-height: 1.8; color: var(--text-secondary);">${job.description}</p>
        
        ${job.requirements ? `
            <h3 style="margin-top: 2rem; margin-bottom: 1rem;">Requirements</h3>
            <p style="line-height: 1.8; color: var(--text-secondary);">${job.requirements}</p>
        ` : ''}
        
        ${contactInfo}
        
        <div style="margin-top: 2rem;">
            ${!hasApplied && currentUser && currentUser.userType === 'jobseeker' ? `
                <button class="btn btn-primary" onclick="openApplyModal('${job.id}'); closeModal();">Apply Now</button>
            ` : hasApplied ? `
                <button class="btn btn-success" disabled>✓ Already Applied</button>
            ` : ''}
        </div>
    `;
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('jobDetailModal').classList.remove('active');
}

function openApplyModal(jobId) {
    if (!currentUser) {
        showNotification('Please login to apply for jobs', 'error');
        showPage('login');
        return;
    }
    
    if (currentUser.userType !== 'jobseeker') {
        showNotification('Only job seekers can apply for jobs', 'error');
        return;
    }
    
    const modal = document.getElementById('applyModal');
    document.getElementById('applyJobId').value = jobId;
    document.getElementById('applicantName').value = currentUser.name;
    document.getElementById('applicantEmail').value = currentUser.email;
    document.getElementById('applicantPhone').value = currentUser.phone;
    
    modal.classList.add('active');
}

function closeApplyModal() {
    document.getElementById('applyModal').classList.remove('active');
    document.getElementById('applyForm').reset();
}

function openReportModal(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    document.getElementById('reportJobId').value = jobId;
    document.getElementById('reportReason').value = '';
    document.getElementById('reportDetails').value = '';
    document.getElementById('reportJobModal').classList.add('active');
}

function closeReportModal() {
    document.getElementById('reportJobModal').classList.remove('active');
    document.getElementById('reportJobForm').reset();
}

function handleReportJob(event) {
    event.preventDefault();

    const jobId = document.getElementById('reportJobId').value;
    const reason = document.getElementById('reportReason').value;
    const details = document.getElementById('reportDetails').value.trim();

    if (!jobId || !reason) {
        showNotification('Please select a reason', 'error');
        return;
    }

    reports.push({
        id: 'report' + Date.now(),
        jobId,
        reporterId: currentUser ? currentUser.id : 'anonymous',
        reason,
        details,
        reportDate: new Date().toISOString(),
        status: 'pending'
    });

    saveToLocalStorage();
    closeReportModal();
    showNotification('Report submitted. We will review it shortly.', 'success');
}

function handleApply(event) {
    event.preventDefault();
    
    const jobId = document.getElementById('applyJobId').value;
    const name = document.getElementById('applicantName').value.trim();
    const email = document.getElementById('applicantEmail').value.trim();
    const phone = document.getElementById('applicantPhone').value.trim();
    const message = document.getElementById('applicantMessage').value.trim();
    const resumeLink = document.getElementById('applicantResume').value.trim();
    
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    const existingApplication = applications.find(
        app => app.jobId === jobId && app.applicantId === currentUser.id
    );
    
    if (existingApplication) {
        showNotification('You have already applied for this job', 'error');
        closeApplyModal();
        return;
    }
    
    const application = {
        id: 'app' + Date.now(),
        jobId,
        jobTitle: job.title,
        company: job.company,
        applicantId: currentUser.id,
        applicantName: name,
        applicantEmail: email,
        applicantPhone: phone,
        message,
        resumeLink,
        appliedDate: new Date().toISOString(),
        status: 'pending'
    };
    
    applications.push(application);
    
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    if (jobIndex > -1) {
        jobs[jobIndex].applicationCount = (jobs[jobIndex].applicationCount || 0) + 1;
    }
    
    saveToLocalStorage();
    
    showNotification('Application submitted successfully!', 'success');
    closeApplyModal();
    
    if (sessionStorage.getItem('currentPage') === 'jobs') {
        displayJobs();
    }
}

function updateDashboard() {
    if (!currentUser) {
        showPage('login');
        return;
    }
    
    const welcomeMsg = document.getElementById('dashboardWelcome');
    welcomeMsg.textContent = `Welcome, ${currentUser.name}!`;
    
    const employerDashboard = document.getElementById('employerDashboard');
    const jobseekerDashboard = document.getElementById('jobseekerDashboard');
    
    if (currentUser.userType === 'employer') {
        employerDashboard.style.display = 'block';
        jobseekerDashboard.style.display = 'none';
        
        const employerJobs = jobs.filter(j => j.employerId === currentUser.id && j.status === 'active');
        const employerJobIds = jobs.filter(j => j.employerId === currentUser.id).map(j => j.id);
        const totalApplications = applications.filter(app => employerJobIds.includes(app.jobId)).length;
        const totalViews = jobs.filter(j => j.employerId === currentUser.id).reduce((sum, j) => sum + (j.views || 0), 0);
        
        document.getElementById('employerActiveJobs').textContent = employerJobs.length;
        document.getElementById('employerTotalApplications').textContent = totalApplications;
        document.getElementById('employerTotalViews').textContent = totalViews;
        
        displayEmployerJobs();
    } else if (currentUser.userType === 'jobseeker') {
        employerDashboard.style.display = 'none';
        jobseekerDashboard.style.display = 'block';
        
        const userApplications = applications.filter(app => app.applicantId === currentUser.id);
        const userSavedJobs = savedJobs.filter(sj => sj.userId === currentUser.id);
        
        document.getElementById('jobseekerApplicationCount').textContent = userApplications.length;
        document.getElementById('jobseekerSavedCount').textContent = userSavedJobs.length;
        document.getElementById('jobseekerProfileViews').textContent = currentUser.profileViews || 0;
        
        displayJobseekerApplications();
    }
}

function displayEmployerJobs() {
    const container = document.getElementById('employerJobs');
    const employerJobs = jobs.filter(job => job.employerId === currentUser.id);
    
    if (employerJobs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No jobs posted yet</h3>
                <p>Click "Post New Job" to create your first job listing</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = employerJobs.map(job => `
        <div class="job-card">
            <div class="job-header">
                <div>
                    <h3 class="job-title">${job.title}</h3>
                    <p class="job-company">${job.company}</p>
                </div>
                <div class="job-salary">$${job.salary.toLocaleString()}/month</div>
            </div>
            <div class="job-details">
                <div class="job-detail-item">
                    <span>📍</span>
                    <span>${job.city}</span>
                </div>
                <div class="job-detail-item">
                    <span>💼</span>
                    <span>${job.type}</span>
                </div>
                <div class="job-detail-item">
                    <span>📅</span>
                    <span>Posted ${new Date(job.postedDate).toLocaleDateString()}</span>
                </div>
            </div>
            <p class="job-description">${job.description.substring(0, 150)}...</p>
            <div class="job-actions">
                <button class="btn btn-danger" onclick="deleteJob('${job.id}')">Delete Job</button>
                <button class="btn btn-secondary" onclick="viewJobDetails('${job.id}')">View Details</button>
            </div>
        </div>
    `).join('');
}

function displayJobseekerApplications() {
    const container = document.getElementById('jobseekerApplications');
    const userApplications = applications.filter(app => app.applicantId === currentUser.id);
    
    if (userApplications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No applications yet</h3>
                <p>Browse jobs and apply to get started</p>
                <button class="btn btn-primary" onclick="showPage('jobs')" style="margin-top: 1rem;">Browse Jobs</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = userApplications.map(app => `
        <div class="application-card">
            <h4>${app.jobTitle}</h4>
            <p><strong>Company:</strong> ${app.company}</p>
            <p><strong>Applied:</strong> ${new Date(app.appliedDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span class="application-status status-${app.status}">${app.status}</span></p>
        </div>
    `).join('');
}

function deleteJob(jobId) {
    if (!currentUser) return;
    
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    if (job.employerId !== currentUser.id && currentUser.userType !== 'admin') {
        showNotification('You can only delete your own jobs', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this job?')) {
        return;
    }
    
    jobs = jobs.filter(j => j.id !== jobId);
    applications = applications.filter(a => a.jobId !== jobId);
    savedJobs = savedJobs.filter(sj => sj.jobId !== jobId);
    
    saveToLocalStorage();
    showNotification('Job deleted successfully', 'success');
    
    const page = sessionStorage.getItem('currentPage');
    if (page === 'admin') {
        displayAdminJobs();
        updateAdminStats();
        displayAdminUsers();
        displayAdminReports();
    } else if (page === 'dashboard') {
        updateDashboard();
    } else {
        displayJobs();
    }
}

function displayAdminJobs() {
    const container = document.getElementById('adminJobListings');
    
    if (jobs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No jobs in the system</h3>
            </div>
        `;
        return;
    }
    
    container.innerHTML = jobs.map(job => {
        const employer = users.find(u => u.id === job.employerId);
        return `
            <div class="job-card">
                <div class="job-header">
                    <div>
                        <h3 class="job-title">${job.title}</h3>
                        <p class="job-company">${job.company}</p>
                        <p style="color: var(--text-secondary); font-size: 0.875rem;">Posted by: ${employer ? employer.name : 'Unknown'}</p>
                    </div>
                    <div class="job-salary">$${job.salary.toLocaleString()}/month</div>
                </div>
                <div class="job-details">
                    <div class="job-detail-item">
                        <span>📍</span>
                        <span>${job.city}</span>
                    </div>
                    <div class="job-detail-item">
                        <span>💼</span>
                        <span>${job.type}</span>
                    </div>
                    <div class="job-detail-item">
                        <span>📅</span>
                        <span>${new Date(job.postedDate).toLocaleDateString()}</span>
                    </div>
                </div>
                <p class="job-description">${job.description.substring(0, 150)}...</p>
                <div class="job-actions">
                    <button class="btn btn-danger" onclick="deleteJob('${job.id}')">Remove Job</button>
                    <button class="btn btn-secondary" onclick="viewJobDetails('${job.id}')">View Details</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateAdminStats() {
    document.getElementById('totalJobs').textContent = jobs.length;
    document.getElementById('totalUsers').textContent = users.filter(u => u.userType !== 'admin').length;
    document.getElementById('totalApplications').textContent = applications.length;
}

function displayAdminReports() {
    const container = document.getElementById('adminReportsList');
    if (!container) return;

    if (!currentUser || currentUser.userType !== 'admin') {
        container.innerHTML = '';
        return;
    }

    if (reports.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Reports</h3>
                <p>No job postings have been reported yet</p>
            </div>
        `;
        return;
    }

    container.innerHTML = reports
        .slice()
        .sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate))
        .map(report => {
            const job = jobs.find(j => j.id === report.jobId);
            const reporter = users.find(u => u.id === report.reporterId);

            return `
                <div class="report-card" style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.25rem; border: 1px solid var(--border-color); border-left: 4px solid var(--danger-color); box-shadow: var(--shadow-md);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap: 1rem;">
                        <div>
                            <h4 style="margin:0 0 0.25rem 0; color: var(--text-primary);">${job ? job.title : 'Job Deleted'}</h4>
                            <p style="margin:0 0 0.25rem 0; color: var(--text-secondary);">Company: ${job ? job.company : 'N/A'}</p>
                            <p style="margin:0; color: var(--text-secondary); font-size: 0.9rem;">Reported by: ${reporter ? reporter.name : report.reporterId}</p>
                        </div>
                        <span class="status-badge status-${report.status}">${report.status}</span>
                    </div>

                    <div style="margin-top: 1rem; color: var(--text-primary);">
                        <p style="margin: 0 0 0.25rem 0;"><strong>Reason:</strong> ${report.reason}</p>
                        ${report.details ? `<p style="margin: 0 0 0.25rem 0;"><strong>Details:</strong> ${report.details}</p>` : ''}
                        <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">Date: ${new Date(report.reportDate).toLocaleString()}</p>
                    </div>

                    <div class="job-actions" style="margin-top: 1rem; gap: 0.5rem;">
                        ${job ? `<button class="btn btn-danger btn-small" onclick="adminDeleteJob('${job.id}', '${report.id}')">Delete Job</button>` : ''}
                        ${job ? `<button class="btn btn-secondary btn-small" onclick="viewJobDetails('${job.id}')">View Job</button>` : ''}
                        <button class="btn btn-success btn-small" onclick="resolveReport('${report.id}')">Mark Resolved</button>
                        <button class="btn btn-secondary btn-small" onclick="dismissReport('${report.id}')">Dismiss</button>
                    </div>
                </div>
            `;
        }).join('');
}

function adminDeleteJob(jobId, reportId) {
    if (!currentUser || currentUser.userType !== 'admin') {
        showNotification('Admin access required', 'error');
        return;
    }

    if (!confirm('Delete this job as admin? This cannot be undone.')) return;

    jobs = jobs.filter(j => j.id !== jobId);
    applications = applications.filter(a => a.jobId !== jobId);
    savedJobs = savedJobs.filter(sj => sj.jobId !== jobId);

    if (reportId) {
        const idx = reports.findIndex(r => r.id === reportId);
        if (idx > -1) reports[idx].status = 'resolved';
    }

    saveToLocalStorage();
    showNotification('Job deleted by admin', 'success');
    
    // Refresh the appropriate view
    if (reportId) {
        displayAdminJobs();
    } else {
        displayJobs();
    }
    updateAdminStats();
    displayAdminUsers();
    displayAdminReports();
}

function resolveReport(reportId) {
    const idx = reports.findIndex(r => r.id === reportId);
    if (idx === -1) return;
    reports[idx].status = 'resolved';
    saveToLocalStorage();
    showNotification('Report resolved', 'success');
    displayAdminReports();
}

function dismissReport(reportId) {
    if (!confirm('Dismiss this report?')) return;
    reports = reports.filter(r => r.id !== reportId);
    saveToLocalStorage();
    showNotification('Report dismissed', 'success');
    displayAdminReports();
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification show ' + type;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

window.onclick = function(event) {
    const jobDetailModal = document.getElementById('jobDetailModal');
    const applyModal = document.getElementById('applyModal');
    const reportModal = document.getElementById('reportJobModal');
    const applicationDetailModal = document.getElementById('applicationDetailModal');
    
    if (event.target === jobDetailModal) {
        closeModal();
    }
    if (event.target === applyModal) {
        closeApplyModal();
    }
    if (event.target === reportModal) {
        closeReportModal();
    }
    if (event.target === applicationDetailModal) {
        closeApplicationDetailModal();
    }
}

function displayManageApplications() {
    if (!currentUser || currentUser.userType !== 'employer') {
        showPage('dashboard');
        return;
    }

    const select = document.getElementById('filterJobSelect');
    if (!select) return;

    const employerJobs = jobs.filter(j => j.employerId === currentUser.id);
    select.innerHTML = `<option value="">All Jobs</option>` + employerJobs
        .map(j => `<option value="${j.id}">${j.title}</option>`)
        .join('');

    filterApplicationsByJob();
}

function filterApplicationsByJob() {
    if (!currentUser || currentUser.userType !== 'employer') return;

    const selectedJobId = document.getElementById('filterJobSelect')?.value || '';
    const container = document.getElementById('applicationsManageList');
    if (!container) return;

    const employerJobIds = jobs.filter(j => j.employerId === currentUser.id).map(j => j.id);
    let list = applications.filter(a => employerJobIds.includes(a.jobId));
    if (selectedJobId) list = list.filter(a => a.jobId === selectedJobId);

    if (list.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No applications found</h3>
                <p>Applications will appear here once job seekers apply</p>
            </div>
        `;
        return;
    }

    container.innerHTML = list
        .slice()
        .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
        .map(app => {
            return `
                <div class="application-card" style="background: var(--card-bg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                    <div style="display:flex; justify-content:space-between; gap:1rem; align-items:flex-start;">
                        <div>
                            <h4 style="margin:0 0 0.25rem 0;">${app.applicantName}</h4>
                            <p style="margin:0 0 0.25rem 0; color: var(--text-secondary);">Job: ${app.jobTitle}</p>
                            <p style="margin:0; color: var(--text-secondary); font-size: 0.9rem;">Applied: ${new Date(app.appliedDate).toLocaleString()}</p>
                        </div>
                        <span class="status-badge status-${app.status}">${app.status}</span>
                    </div>

                    <div style="margin-top: 0.75rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
                        <button class="btn btn-secondary btn-small" onclick="openApplicationDetail('${app.id}')">View</button>
                        <button class="btn btn-success btn-small" onclick="updateApplicationStatus('${app.id}', 'accepted')">Accept</button>
                        <button class="btn btn-danger btn-small" onclick="updateApplicationStatus('${app.id}', 'rejected')">Reject</button>
                        <button class="btn btn-warning btn-small" onclick="updateApplicationStatus('${app.id}', 'reviewing')">Reviewing</button>
                    </div>
                </div>
            `;
        }).join('');
}

function openApplicationDetail(appId) {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    const content = document.getElementById('applicationDetailContent');
    const modal = document.getElementById('applicationDetailModal');
    if (!content || !modal) return;

    content.innerHTML = `
        <h2>Application Details</h2>
        <p><strong>Job:</strong> ${app.jobTitle}</p>
        <p><strong>Applicant:</strong> ${app.applicantName}</p>
        <p><strong>Email:</strong> <a href="mailto:${app.applicantEmail}">${app.applicantEmail}</a></p>
        <p><strong>Phone:</strong> <a href="tel:${app.applicantPhone}">${app.applicantPhone}</a></p>
        <p><strong>Applied:</strong> ${new Date(app.appliedDate).toLocaleString()}</p>
        <p><strong>Status:</strong> <span class="status-badge status-${app.status}">${app.status}</span></p>
        ${app.resumeLink ? `<p><strong>Resume:</strong> <a href="${app.resumeLink}" target="_blank">Open resume</a></p>` : ''}
        ${app.message ? `<div style="margin-top: 1rem;"><strong>Message:</strong><p style="margin-top:0.5rem; color: var(--text-secondary);">${app.message}</p></div>` : ''}
        <div class="job-actions" style="margin-top: 1.25rem; gap: 0.5rem;">
            <button class="btn btn-success btn-small" onclick="updateApplicationStatus('${app.id}', 'accepted')">Accept</button>
            <button class="btn btn-danger btn-small" onclick="updateApplicationStatus('${app.id}', 'rejected')">Reject</button>
            <button class="btn btn-warning btn-small" onclick="updateApplicationStatus('${app.id}', 'reviewing')">Reviewing</button>
            <button class="btn btn-secondary btn-small" onclick="closeApplicationDetailModal()">Close</button>
        </div>
    `;

    modal.classList.add('active');
}

function closeApplicationDetailModal() {
    const modal = document.getElementById('applicationDetailModal');
    if (modal) modal.classList.remove('active');
}

function updateApplicationStatus(appId, status) {
    const idx = applications.findIndex(a => a.id === appId);
    if (idx === -1) return;

    applications[idx].status = status;
    saveToLocalStorage();
    showNotification('Application status updated', 'success');

    const page = sessionStorage.getItem('currentPage');
    if (page === 'manageApplications') {
        filterApplicationsByJob();
    }
    if (page === 'dashboard') {
        updateDashboard();
    }
    if (document.getElementById('applicationDetailModal')?.classList.contains('active')) {
        openApplicationDetail(appId);
    }
}

function getJobRecommendations() {
    if (!currentUser || currentUser.userType !== 'jobseeker') return [];

    const userCity = currentUser.city;
    const userSkills = (currentUser.skills || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

    return jobs
        .filter(j => j.status === 'active')
        .map(job => {
            let score = 0;
            if (userCity && job.city === userCity) score += 3;
            for (const skill of userSkills) {
                if (job.title.toLowerCase().includes(skill) || job.description.toLowerCase().includes(skill)) score += 2;
            }

            const hasApplied = applications.some(a => a.applicantId === currentUser.id && a.jobId === job.id);
            if (hasApplied) score -= 100;

            return { job, score };
        })
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(x => x.job);
}

function editJob(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    document.getElementById('editJobId').value = job.id;
    document.getElementById('jobTitle').value = job.title;
    document.getElementById('jobCompany').value = job.company;
    document.getElementById('jobCategory').value = job.category || '';
    document.getElementById('jobDescription').value = job.description;
    document.getElementById('jobRequirements').value = job.requirements || '';
    document.getElementById('jobType').value = job.type;
    document.getElementById('jobExperience').value = job.experience || '';
    document.getElementById('jobSalary').value = job.salary;
    document.getElementById('jobRemote').value = job.remote || 'false';
    document.getElementById('jobCity').value = job.city;
    document.getElementById('jobContact').value = job.contact;
    document.getElementById('jobDeadline').value = job.deadline || '';
    document.getElementById('jobVacancies').value = job.vacancies || 1;
    
    document.getElementById('submitJobBtn').textContent = 'Update Job';
    showPage('postJob');
}

function toggleSaveJob(jobId) {
    if (!currentUser || currentUser.userType !== 'jobseeker') {
        showNotification('Please login as a job seeker to save jobs', 'error');
        return;
    }
    
    const index = savedJobs.findIndex(sj => sj.userId === currentUser.id && sj.jobId === jobId);
    
    if (index > -1) {
        savedJobs.splice(index, 1);
        showNotification('Job removed from saved list', 'success');
    } else {
        savedJobs.push({
            id: 'saved' + Date.now(),
            userId: currentUser.id,
            jobId: jobId,
            savedDate: new Date().toISOString()
        });
        showNotification('Job saved successfully!', 'success');
    }
    
    saveToLocalStorage();
    
    if (sessionStorage.getItem('currentPage') === 'savedJobs') {
        displaySavedJobs();
    } else {
        filterJobs();
    }
}

function displaySavedJobs() {
    if (!currentUser) {
        showPage('login');
        return;
    }
    
    const container = document.getElementById('savedJobsList');
    const userSavedJobs = savedJobs.filter(sj => sj.userId === currentUser.id);
    const savedJobsList = userSavedJobs.map(sj => jobs.find(j => j.id === sj.jobId)).filter(j => j);
    
    if (savedJobsList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No saved jobs yet</h3>
                <p>Browse jobs and click the bookmark icon to save them for later</p>
                <button class="btn btn-primary" onclick="showPage('jobs')" style="margin-top: 1rem;">Browse Jobs</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = savedJobsList.map(job => `
        <div class="job-card">
            <div class="job-header">
                <div>
                    <h3 class="job-title">${job.title}</h3>
                    <p class="job-company">${job.company}</p>
                </div>
                <div class="job-salary">$${job.salary.toLocaleString()}/month</div>
            </div>
            <div class="job-details">
                <div class="job-detail-item"><span>📍</span><span>${job.city}</span></div>
                <div class="job-detail-item"><span>💼</span><span>${job.type}</span></div>
                <div class="job-detail-item"><span>📂</span><span>${job.category || 'N/A'}</span></div>
            </div>
            <p class="job-description">${job.description.substring(0, 150)}...</p>
            <div class="job-actions">
                <button class="btn btn-primary" onclick="openApplyModal('${job.id}')">Apply Now</button>
                <button class="btn btn-secondary" onclick="viewJobDetails('${job.id}')">View Details</button>
                <button class="btn btn-danger" onclick="toggleSaveJob('${job.id}')">Remove</button>
            </div>
        </div>
    `).join('');
}

function loadProfile() {
    if (!currentUser) return;
    
    document.getElementById('profileDisplayName').textContent = currentUser.name;
    document.getElementById('profileDisplayEmail').textContent = currentUser.email;
    document.getElementById('profileDisplayType').textContent = currentUser.userType === 'jobseeker' ? 'Job Seeker' : 'Employer';
    
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    document.getElementById('avatarInitials').textContent = initials;
    
    document.getElementById('profileName').value = currentUser.name;
    document.getElementById('profileEmail').value = currentUser.email;
    document.getElementById('profilePhone').value = currentUser.phone;
    document.getElementById('profileCity').value = currentUser.city || '';
    document.getElementById('profileBio').value = currentUser.bio || '';
    
    if (currentUser.userType === 'jobseeker') {
        document.getElementById('profileEducation').value = currentUser.education || '';
        document.getElementById('profileExperience').value = currentUser.workExperience || '';
        document.getElementById('profileSkills').value = currentUser.skills || '';
        document.getElementById('profileLinkedIn').value = currentUser.linkedIn || '';
        document.getElementById('profilePortfolio').value = currentUser.portfolio || '';
        document.getElementById('resumeMenuBtn').style.display = 'block';
        document.getElementById('companyMenuBtn').style.display = 'none';
        document.getElementById('networkMenuBtn').style.display = 'block';
    } else if (currentUser.userType === 'employer') {
        document.getElementById('companyName').value = currentUser.companyName || '';
        document.getElementById('companyDescription').value = currentUser.companyDescription || '';
        document.getElementById('companyIndustry').value = currentUser.companyIndustry || '';
        document.getElementById('companySize').value = currentUser.companySize || '';
        document.getElementById('companyWebsite').value = currentUser.companyWebsite || '';
        document.getElementById('resumeMenuBtn').style.display = 'none';
        document.getElementById('companyMenuBtn').style.display = 'block';
        document.getElementById('networkMenuBtn').style.display = 'none';
    }
    
    loadActivitySection();
    loadNetworkSection();
    loadSettingsPreferences();
}

function showProfileSection(section, evt) {
    document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.profile-menu-item').forEach(m => m.classList.remove('active'));
    
    document.getElementById('profile' + section.charAt(0).toUpperCase() + section.slice(1) + 'Section').classList.add('active');
    const implicitEvent = (typeof event !== 'undefined') ? event : null;
    const e = evt || implicitEvent || (typeof window !== 'undefined' ? window.event : null);
    if (e && e.target) {
        e.target.classList.add('active');
    }
}

function updateProfile(event) {
    event.preventDefault();
    
    currentUser.name = document.getElementById('profileName').value.trim();
    currentUser.email = document.getElementById('profileEmail').value.trim();
    currentUser.phone = document.getElementById('profilePhone').value.trim();
    currentUser.city = document.getElementById('profileCity').value;
    currentUser.bio = document.getElementById('profileBio').value.trim();
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex > -1) {
        users[userIndex] = currentUser;
    }
    
    saveToLocalStorage();
    loadProfile();
    showNotification('Profile updated successfully!', 'success');
}

function updateResume(event) {
    event.preventDefault();
    
    currentUser.education = document.getElementById('profileEducation').value.trim();
    currentUser.workExperience = document.getElementById('profileExperience').value.trim();
    currentUser.skills = document.getElementById('profileSkills').value.trim();
    currentUser.linkedIn = document.getElementById('profileLinkedIn').value.trim();
    currentUser.portfolio = document.getElementById('profilePortfolio').value.trim();
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex > -1) {
        users[userIndex] = currentUser;
    }
    
    saveToLocalStorage();
    showNotification('Resume information updated!', 'success');
}

function updateCompanyInfo(event) {
    event.preventDefault();
    
    currentUser.companyName = document.getElementById('companyName').value.trim();
    currentUser.companyDescription = document.getElementById('companyDescription').value.trim();
    currentUser.companyIndustry = document.getElementById('companyIndustry').value;
    currentUser.companySize = document.getElementById('companySize').value;
    currentUser.companyWebsite = document.getElementById('companyWebsite').value.trim();
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex > -1) {
        users[userIndex] = currentUser;
    }
    
    saveToLocalStorage();
    showNotification('Company information updated!', 'success');
}

function changePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (currentPassword !== currentUser.password) {
        showNotification('Current password is incorrect', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    currentUser.password = newPassword;
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex > -1) {
        users[userIndex] = currentUser;
    }
    
    saveToLocalStorage();
    document.getElementById('changePasswordForm').reset();
    showNotification('Password changed successfully!', 'success');
}

function saveNotificationSettings() {
    currentUser.notifyNewJobs = document.getElementById('notifyNewJobs').checked;
    currentUser.notifyApplications = document.getElementById('notifyApplications').checked;
    currentUser.notifyMessages = document.getElementById('notifyMessages').checked;
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex > -1) {
        users[userIndex] = currentUser;
    }
    
    saveToLocalStorage();
    showNotification('Notification preferences saved!', 'success');
}

function deleteAccount() {
    if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
        return;
    }
    
    if (!confirm('This will permanently delete all your data. Are you sure?')) {
        return;
    }
    
    users = users.filter(u => u.id !== currentUser.id);
    jobs = jobs.filter(j => j.employerId !== currentUser.id);
    applications = applications.filter(a => a.applicantId !== currentUser.id);
    savedJobs = savedJobs.filter(sj => sj.userId !== currentUser.id);
    
    currentUser = null;
    saveToLocalStorage();
    updateNavigation();
    showNotification('Account deleted successfully', 'success');
    showPage('home');
}

function changeAvatar() {
    const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.getElementById('profileAvatar').style.background = randomColor;
    showNotification('Avatar color changed!', 'success');
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
    if (document.body) document.body.classList.toggle('dark-mode', isDarkMode);
    
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
    
    localStorage.setItem('jobconnect_darkMode', String(isDarkMode));
    
    showNotification(isDarkMode ? 'Dark mode enabled' : 'Light mode enabled', 'success');
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('jobconnect_darkMode');
    if (savedTheme === null) localStorage.setItem('jobconnect_darkMode', 'true');
    isDarkMode = savedTheme === null ? true : savedTheme === 'true';
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
    if (document.body) document.body.classList.toggle('dark-mode', isDarkMode);
    
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
}

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.job-card, .feature-card, .stat-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

function addParticleBackground() {
    const hero = document.querySelector('.hero');
    if (!hero || hero.querySelector('.particles')) return;
    
    const particles = document.createElement('div');
    particles.className = 'particles';
    particles.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;
    `;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 10}s infinite ease-in-out;
        `;
        particles.appendChild(particle);
    }
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-20px) translateX(10px); }
            50% { transform: translateY(-40px) translateX(-10px); }
            75% { transform: translateY(-20px) translateX(5px); }
        }
    `;
    document.head.appendChild(style);
    
    hero.style.position = 'relative';
    hero.appendChild(particles);
}

function animateHomeStats() {
    // Force immediate update with current data, then refresh with file data
    updateStatsImmediately();
    
    // Also try to load from files for most accurate data
    loadFromFiles().then(() => {
        updateStatsImmediately();
    }).catch(error => {
        console.error('Error loading data for stats:', error);
        updateStatsImmediately();
    });
}

function updateStatsImmediately() {
    // Count ALL jobs (not just active)
    const totalJobs = jobs.length;
    
    // Count ALL users (total accounts)
    const totalAccounts = users.length;
    
    // Count ONLY job seekers
    const totalJobSeekers = users.filter(u => u.userType === 'jobseeker').length;
    
    console.log('ACCURATE Stats Update:', {
        totalJobs: totalJobs,
        totalAccounts: totalAccounts,
        totalJobSeekers: totalJobSeekers,
        allUsers: users.map(u => ({ id: u.id, name: u.name, type: u.userType }))
    });
    
    // Update the display with ACCURATE counts
    animateCounter('liveJobCount', totalJobs);
    animateCounter('liveUserCount', totalAccounts);
    animateCounter('liveJobSeekerCount', totalJobSeekers);
}

function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const safeTarget = Number(targetValue) || 0;
    if (safeTarget <= 0) {
        element.textContent = '0';
        return;
    }
    
    let current = 0;
    const increment = Math.max(1, Math.ceil(safeTarget / 50));
    const duration = 2000;
    const stepTime = Math.max(16, duration / Math.ceil(safeTarget / increment));
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= safeTarget) {
            current = safeTarget;
            clearInterval(timer);
        }
        element.textContent = current.toLocaleString();
    }, stepTime);
}

function clearSearch() {
    const searchInput = document.getElementById('searchKeyword');
    if (searchInput) {
        searchInput.value = '';
        hideSearchSuggestions();
        filterJobs();
    }
}

function handleSearchInput(event) {
    const keyword = event.target.value.trim();
    
    if (keyword.length > 0) {
        showSearchSuggestions();
        updateSearchSuggestions(keyword);
    } else {
        hideSearchSuggestions();
    }
    
    filterJobs();
}

function updateSearchSuggestions(keyword) {
    const container = document.getElementById('searchSuggestions');
    if (!container) return;
    
    const lowerKeyword = keyword.toLowerCase();
    
    const matchingJobs = jobs
        .filter(j => j.status === 'active')
        .filter(j => 
            j.title.toLowerCase().includes(lowerKeyword) ||
            j.company.toLowerCase().includes(lowerKeyword) ||
            j.description.toLowerCase().includes(lowerKeyword) ||
            (j.category && j.category.toLowerCase().includes(lowerKeyword))
        )
        .slice(0, 8);
    
    const uniqueTitles = [...new Set(matchingJobs.map(j => j.title))].slice(0, 5);
    const uniqueCompanies = [...new Set(matchingJobs.map(j => j.company))].slice(0, 3);
    
    const suggestions = [];
    
    uniqueTitles.forEach(title => {
        suggestions.push({
            type: 'job',
            icon: '💼',
            title: highlightMatch(title, keyword),
            meta: 'Job Title',
            value: title
        });
    });
    
    uniqueCompanies.forEach(company => {
        suggestions.push({
            type: 'company',
            icon: '🏢',
            title: highlightMatch(company, keyword),
            meta: 'Company',
            value: company
        });
    });
    
    if (suggestions.length === 0) {
        container.innerHTML = `
            <div class="suggestion-item" style="cursor: default;">
                <span class="suggestion-icon">🔍</span>
                <div class="suggestion-text">
                    <p class="suggestion-title">No results found</p>
                    <p class="suggestion-meta">Try different keywords</p>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = suggestions.map(s => `
            <div class="suggestion-item" onclick="selectSuggestion('${s.value.replace(/'/g, "\\'")}')">  
                <span class="suggestion-icon">${s.icon}</span>
                <div class="suggestion-text">
                    <p class="suggestion-title">${s.title}</p>
                    <p class="suggestion-meta">${s.meta}</p>
                </div>
            </div>
        `).join('');
    }
}

function highlightMatch(text, keyword) {
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<span class="suggestion-highlight">$1</span>');
}

function selectSuggestion(value) {
    document.getElementById('searchKeyword').value = value;
    hideSearchSuggestions();
    filterJobs();
}

function showSearchSuggestions() {
    const container = document.getElementById('searchSuggestions');
    const keyword = document.getElementById('searchKeyword')?.value.trim();
    if (container && keyword && keyword.length > 0) {
        container.classList.add('active');
    }
}

function hideSearchSuggestions() {
    const container = document.getElementById('searchSuggestions');
    if (container) {
        setTimeout(() => container.classList.remove('active'), 200);
    }
}

function displayAdminUsers() {
    const container = document.getElementById('adminUsersList');
    if (!container) return;

    const list = users.filter(u => u.userType !== 'admin');
    if (list.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No users found</h3>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(u => {
        const userJobs = jobs.filter(j => j.employerId === u.id).length;
        const userApps = applications.filter(a => a.applicantId === u.id).length;
        return `
            <div style="background: var(--card-bg); padding: 1.25rem; border-radius: 12px; margin-bottom: 1rem; box-shadow: var(--shadow-md); border: 1px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; gap: 1rem; align-items: start;">
                    <div>
                        <h4 style="margin-bottom: 0.25rem; color: var(--text-primary);">${u.name}</h4>
                        <p style="margin-bottom: 0.25rem; color: var(--text-secondary);">${u.email}</p>
                        <p style="margin-bottom: 0.25rem; color: var(--text-secondary);">Type: ${u.userType}</p>
                        <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">Jobs: ${userJobs} | Applications: ${userApps}</p>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                        <button class="btn btn-danger btn-small" onclick="adminDeleteUser('${u.id}')">Delete User</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function adminDeleteUser(userId) {
    if (!currentUser || currentUser.userType !== 'admin') {
        showNotification('Admin access required', 'error');
        return;
    }

    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (!confirm(`Delete ${user.name}? This will remove their jobs, applications, and saved jobs.`)) {
        return;
    }

    const userJobIds = jobs.filter(j => j.employerId === userId).map(j => j.id);
    users = users.filter(u => u.id !== userId);
    jobs = jobs.filter(j => j.employerId !== userId);
    applications = applications.filter(a => a.applicantId !== userId && !userJobIds.includes(a.jobId));
    savedJobs = savedJobs.filter(sj => sj.userId !== userId && !userJobIds.includes(sj.jobId));
    reports = reports.filter(r => r.reporterId !== userId && !userJobIds.includes(r.jobId));

    saveToLocalStorage();
    showNotification('User deleted', 'success');

    displayAdminUsers();
    displayAdminJobs();
    updateAdminStats();
    displayAdminReports();
}

function getFilterValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : '';
}

function ensureHiddenFilters() {
    if (!document.getElementById('filterCity')) {
        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.id = 'filterCity';
        hidden.value = '';
        document.body.appendChild(hidden);
    }
    if (!document.getElementById('filterJobType')) {
        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.id = 'filterJobType';
        hidden.value = '';
        document.body.appendChild(hidden);
    }
    if (!document.getElementById('filterCategory')) {
        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.id = 'filterCategory';
        hidden.value = '';
        document.body.appendChild(hidden);
    }
    if (!document.getElementById('filterExperience')) {
        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.id = 'filterExperience';
        hidden.value = '';
        document.body.appendChild(hidden);
    }
    if (!document.getElementById('filterRemote')) {
        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.id = 'filterRemote';
        hidden.value = '';
        document.body.appendChild(hidden);
    }
}

function toggleFilterSection(sectionId) {
    const content = document.getElementById('filter-' + sectionId);
    const header = content.previousElementSibling;
    
    if (content.classList.contains('active')) {
        content.classList.remove('active');
        header.classList.add('collapsed');
    } else {
        content.classList.add('active');
        header.classList.remove('collapsed');
    }
}

function selectCity(element, city) {
    document.querySelectorAll('[data-city]').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    ensureHiddenFilters();
    document.getElementById('filterCity').value = city;
    filterJobs();
    updateActiveFilters();
}

function selectCategory(element, category) {
    document.querySelectorAll('[data-category]').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    ensureHiddenFilters();
    document.getElementById('filterCategory').value = category;
    filterJobs();
    updateActiveFilters();
}

function selectExperience(element, exp) {
    document.querySelectorAll('[data-exp]').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    ensureHiddenFilters();
    document.getElementById('filterExperience').value = exp;
    filterJobs();
    updateActiveFilters();
}

function selectRemote(element, remote) {
    document.querySelectorAll('[data-remote]').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    ensureHiddenFilters();
    document.getElementById('filterRemote').value = remote;
    filterJobs();
    updateActiveFilters();
}

function filterByJobType() {
    const checkboxes = document.querySelectorAll('.filter-checkbox input[type="checkbox"]');
    const selected = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
    
    if (selected.length === 0) {
        document.getElementById('filterJobType').value = '';
    } else {
        document.getElementById('filterJobType').value = selected[0];
    }
    
    filterJobs();
    updateActiveFilters();
}

function setSalaryRange(min, max) {
    document.getElementById('filterSalaryMin').value = min;
    document.getElementById('filterSalaryMax').value = max;
    filterJobs();
    updateActiveFilters();
}

function updateActiveFilters() {
    const container = document.getElementById('activeFilters');
    if (!container) return;
    
    const filters = [];
    
    const city = document.getElementById('filterCity')?.value;
    if (city) filters.push({ label: `📍 ${city}`, clear: () => selectCity(document.querySelector('[data-city=""]'), '') });
    
    const category = document.getElementById('filterCategory')?.value;
    if (category) filters.push({ label: `🏢 ${category}`, clear: () => selectCategory(document.querySelector('[data-category=""]'), '') });
    
    const experience = document.getElementById('filterExperience')?.value;
    if (experience) filters.push({ label: `📊 ${experience}`, clear: () => selectExperience(document.querySelector('[data-exp=""]'), '') });
    
    const remote = document.getElementById('filterRemote')?.value;
    if (remote) {
        const label = remote === 'true' ? 'Remote' : remote === 'hybrid' ? 'Hybrid' : 'On-site';
        filters.push({ label: `🏠 ${label}`, clear: () => selectRemote(document.querySelector('[data-remote=""]'), '') });
    }
    
    const salaryMin = document.getElementById('filterSalaryMin')?.value;
    const salaryMax = document.getElementById('filterSalaryMax')?.value;
    if (salaryMin || salaryMax) {
        const label = `💰 $${salaryMin || '0'} - $${salaryMax || '∞'}`;
        filters.push({ label, clear: () => { 
            document.getElementById('filterSalaryMin').value = '';
            document.getElementById('filterSalaryMax').value = '';
            filterJobs();
            updateActiveFilters();
        }});
    }
    
    container.innerHTML = filters.map((f, i) => `
        <div class="active-filter-tag">
            <span>${f.label}</span>
            <button onclick="(${f.clear.toString()})()" title="Remove filter">×</button>
        </div>
    `).join('');
}

function addButtonRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        left: ${x}px;
        top: ${y}px;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

function loadActivitySection() {
    if (!currentUser) return;
    
    const userApps = applications.filter(a => a.applicantId === currentUser.id);
    const userSaved = savedJobs.filter(sj => sj.userId === currentUser.id);
    
    document.getElementById('activityApplications').textContent = userApps.length;
    document.getElementById('activitySaved').textContent = userSaved.length;
    document.getElementById('activityViews').textContent = currentUser.profileViews || 0;
    
    const activityList = document.getElementById('activityList');
    const recentActivities = [
        ...userApps.slice(0, 3).map(a => ({
            type: 'application',
            text: `Applied to ${a.jobTitle}`,
            date: a.appliedDate,
            icon: '📝'
        })),
        ...userSaved.slice(0, 2).map(sj => {
            const job = jobs.find(j => j.id === sj.jobId);
            return {
                type: 'saved',
                text: `Saved ${job ? job.title : 'a job'}`,
                date: sj.savedDate,
                icon: '⭐'
            };
        })
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    if (recentActivities.length === 0) {
        activityList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No recent activity</p>';
    } else {
        activityList.innerHTML = recentActivities.map(act => `
            <div class="activity-item">
                <span style="font-size: 1.5rem; margin-right: 0.75rem;">${act.icon}</span>
                <div style="flex: 1;">
                    <p style="margin: 0; color: var(--text-primary); font-weight: 500;">${act.text}</p>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 0.85rem;">${new Date(act.date).toLocaleDateString()}</p>
                </div>
            </div>
        `).join('');
    }
}

function loadNetworkSection() {
    if (!currentUser) return;
    
    document.getElementById('networkConnections').textContent = currentUser.connections || 0;
    document.getElementById('networkFollowing').textContent = currentUser.following || 0;
    
    const suggestions = users.filter(u => u.id !== currentUser.id && u.userType === currentUser.userType).slice(0, 3);
    const suggestionsContainer = document.getElementById('networkSuggestions');
    
    if (suggestions.length === 0) {
        suggestionsContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No suggestions available</p>';
    } else {
        suggestionsContainer.innerHTML = suggestions.map(u => `
            <div class="network-suggestion-card">
                <div>
                    <h5 style="margin: 0 0 0.25rem 0; color: var(--text-primary);">${u.name}</h5>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">${u.userType === 'jobseeker' ? 'Job Seeker' : 'Employer'}</p>
                </div>
                <button class="btn btn-primary btn-small" onclick="connectUser('${u.id}')">Connect</button>
            </div>
        `).join('');
    }
    
    const companies = ['TechCorp Inc.', 'MarketPro', 'Creative Studio', 'Data Insights LLC'];
    const followingContainer = document.getElementById('followingCompanies');
    followingContainer.innerHTML = companies.slice(0, 3).map(c => `
        <div class="company-card">
            <div>
                <h5 style="margin: 0; color: var(--text-primary);">${c}</h5>
                <p style="margin: 0; color: var(--text-secondary); font-size: 0.85rem;">Technology Company</p>
            </div>
            <button class="btn btn-secondary btn-small">Following</button>
        </div>
    `).join('');
}

function loadSettingsPreferences() {
    if (!currentUser) return;
    
    document.getElementById('notifyNewJobs').checked = currentUser.notifyNewJobs !== false;
    document.getElementById('notifyApplications').checked = currentUser.notifyApplications !== false;
    document.getElementById('notifyMessages').checked = currentUser.notifyMessages !== false;
    document.getElementById('notifyRecommendations').checked = currentUser.notifyRecommendations !== false;
    document.getElementById('profilePublic').checked = currentUser.profilePublic !== false;
    document.getElementById('showActivity').checked = currentUser.showActivity !== false;
    document.getElementById('allowMessages').checked = currentUser.allowMessages === true;
}

function saveAllSettings() {
    if (!currentUser) return;
    
    currentUser.notifyNewJobs = document.getElementById('notifyNewJobs').checked;
    currentUser.notifyApplications = document.getElementById('notifyApplications').checked;
    currentUser.notifyMessages = document.getElementById('notifyMessages').checked;
    currentUser.notifyRecommendations = document.getElementById('notifyRecommendations').checked;
    currentUser.profilePublic = document.getElementById('profilePublic').checked;
    currentUser.showActivity = document.getElementById('showActivity').checked;
    currentUser.allowMessages = document.getElementById('allowMessages').checked;
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex > -1) {
        users[userIndex] = currentUser;
    }
    
    saveToLocalStorage();
    showNotification('All settings saved successfully!', 'success');
}

function setTheme(theme) {
    document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
    event.target.closest('.theme-option').classList.add('active');
    
    if (theme === 'dark') {
        isDarkMode = true;
        document.documentElement.classList.add('dark-mode');
        if (document.body) document.body.classList.add('dark-mode');
        localStorage.setItem('jobconnect_darkMode', 'true');
        const icon = document.querySelector('.theme-icon');
        if (icon) icon.textContent = '☀️';
    } else if (theme === 'light') {
        isDarkMode = false;
        document.documentElement.classList.remove('dark-mode');
        if (document.body) document.body.classList.remove('dark-mode');
        localStorage.setItem('jobconnect_darkMode', 'false');
        const icon = document.querySelector('.theme-icon');
        if (icon) icon.textContent = '🌙';
    }
    
    showNotification(`Theme set to ${theme} mode`, 'success');
}

function connectUser(userId) {
    showNotification('Connection request sent!', 'success');
}

function switchAuthTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginWrapper = document.getElementById('loginFormWrapper');
    const signupWrapper = document.getElementById('signupFormWrapper');
    const indicator = document.getElementById('tabIndicator');
    const container = document.querySelector('.auth-forms-container');
    
    if (tab === 'login') {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        indicator.classList.remove('signup');
        container.classList.remove('signup-active');
        
        signupWrapper.classList.remove('active');
        signupWrapper.classList.add('slide-out-left');
        
        setTimeout(() => {
            signupWrapper.classList.remove('slide-out-left');
            loginWrapper.classList.remove('slide-in-right');
            loginWrapper.classList.add('active');
        }, 50);
    } else if (tab === 'signup') {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        indicator.classList.add('signup');
        container.classList.add('signup-active');
        
        loginWrapper.classList.remove('active');
        loginWrapper.classList.add('slide-out-left');
        
        setTimeout(() => {
            loginWrapper.classList.remove('slide-out-left');
            signupWrapper.classList.remove('slide-in-right');
            signupWrapper.classList.add('active');
        }, 50);
    }
}

function toggleFilterSidebar() {
    const sidebar = document.getElementById('filtersSidebar');
    sidebar.classList.toggle('collapsed');
}

document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', addButtonRipple);
});

document.addEventListener('DOMContentLoaded', initializeApp);

setInterval(() => {
    if (currentUser && currentUser.userType === 'jobseeker') {
        const recommendations = getJobRecommendations();
        if (recommendations.length > 0 && Math.random() > 0.95) {
            showNotification(`New job recommendation: ${recommendations[0].title}`, 'success');
        }
    }
}, 60000);
