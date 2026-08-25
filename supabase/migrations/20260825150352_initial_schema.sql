-- Migration: Initial Schema

-- problems table
CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    topic TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX problems_topic_idx ON problems(topic);

-- solutions table
CREATE TABLE solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    github_path TEXT NOT NULL,
    current_code TEXT NOT NULL,
    latest_commit_sha TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (problem_id, user_id, language)
);

-- solution_revisions table
CREATE TABLE solution_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE,
    commit_sha TEXT NOT NULL,
    code TEXT NOT NULL,
    commit_message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(solution_id, commit_sha)
);

-- flashcards table
CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    next_review_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- notes table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ai_conversations table
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ai_messages table
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- user_progress table
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('not_started', 'attempted', 'solved', 'review')) DEFAULT 'not_started',
    attempts INTEGER DEFAULT 0,
    solved_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, problem_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policies

-- problems: anyone can read
CREATE POLICY "Problems are readable by authenticated users"
ON problems FOR SELECT
TO authenticated
USING (true);

-- solutions
CREATE POLICY "Users can manage their own solutions"
ON solutions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- solution_revisions
CREATE POLICY "Users can manage their own solution revisions"
ON solution_revisions FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM solutions WHERE solutions.id = solution_revisions.solution_id AND solutions.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM solutions WHERE solutions.id = solution_revisions.solution_id AND solutions.user_id = auth.uid()));

-- flashcards
CREATE POLICY "Users can manage their own flashcards"
ON flashcards FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- notes
CREATE POLICY "Users can manage their own notes"
ON notes FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ai_conversations
CREATE POLICY "Users can manage their own conversations"
ON ai_conversations FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ai_messages
CREATE POLICY "Users can manage their own messages"
ON ai_messages FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid()));

-- user_progress
CREATE POLICY "Users can manage their own progress"
ON user_progress FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at columns
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW; 
END;
$$ language 'plpgsql';

CREATE TRIGGER update_problems_modtime BEFORE UPDATE ON problems FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_solutions_modtime BEFORE UPDATE ON solutions FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_flashcards_modtime BEFORE UPDATE ON flashcards FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_notes_modtime BEFORE UPDATE ON notes FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_ai_conversations_modtime BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_user_progress_modtime BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
