import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import QuestionAnswer from './components/QuestionAnswer';

function App() {
    const [pdf, setPdf] = useState(null);

    return (
        <div>
            <FileUpload onUpload={setPdf} />
            {pdf && <QuestionAnswer pdf={pdf} />}
        </div>
    );
}

export default App;
